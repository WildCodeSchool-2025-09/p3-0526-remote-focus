/**
 * Casting complet des médias déjà présents dans le dump principal.
 *
 * Produit un fichier SÉPARÉ, server/database/seeds/tmdb-cast.json.gz :
 *   - tout le casting de chaque média (aucun plafond)
 *   - tout le casting de chaque épisode (réguliers + invités)
 *   - les fiches des acteurs absents du dump principal
 *
 * tmdb.json.gz n'est jamais modifié. L'enrichissement s'applique
 * ensuite, et seulement si on le veut, via tmdbActSeed.ts :
 *
 *   npm run tmdb:seed      → le catalogue
 *   npm run tmdbAct:seed   → le casting complet par-dessus
 *
 * Le script sauvegarde son avancement par lots : s'il est interrompu,
 * le relancer reprend là où il s'était arrêté.
 *
 * Usage : npm run tmdb:fetch:cast
 */

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/* ================================================================== *
 * 1. CONFIGURATION
 * ================================================================== */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const LANG = "fr-FR";
const FALLBACK_LANG = "en-US";

/**
 * Débit maximal, en requêtes par seconde.
 *
 * TMDB a désactivé sa limite stricte en décembre 2019 et annonce
 * aujourd'hui un seuil indicatif d'environ 40 req/s, avec un 429 à la
 * clé si on le dépasse. On se cale à 32 : assez bas pour ne jamais
 * déclencher de 429, assez haut pour que le run reste court.
 */
const RATE_LIMIT = 32;

/**
 * Requêtes simultanées. Plus haut que le débit visé, pour absorber les
 * réponses lentes : c'est RATE_LIMIT qui cadence réellement les départs,
 * ce plafond ne sert qu'à éviter d'accumuler les requêtes en vol.
 */
const CONCURRENCY = 40;

const MAX_RETRIES = 4;

/**
 * Cache disque. Désactivé ici : sur un run de plusieurs centaines de
 * milliers de requêtes, il crée autant de petits fichiers, ce qui sature
 * le disque et ralentit tout. La reprise est assurée par les
 * sauvegardes intermédiaires ci-dessous.
 */
const USE_CACHE = false;

/** Taille des lots traités avant de considérer une sauvegarde. */
const CHECKPOINT_EVERY = 2000;

/**
 * Délai minimal entre deux sauvegardes, en secondes. Le fichier pèse
 * plusieurs centaines de Mo une fois sérialisé : l'écrire à chaque lot
 * coûterait plus cher que les requêtes elles-mêmes.
 */
const CHECKPOINT_MIN_INTERVAL = 60;

/** Quels médias traiter. Mettre un type à false l'exclut. */
const SCOPE = {
  movies: true,
  series: true,
  animes: true,
};

/** Restreindre à quelques médias (leur tmdb_id). Vide = tous. */
const ONLY_MEDIA_TMDB_IDS: number[] = [];

/** Télécharger la biographie des acteurs découverts. */
const FETCH_PERSON_DETAILS = true;

/** Délai avant démarrage, pour laisser le temps d'annuler (Ctrl+C). */
const COUNTDOWN_SECONDS = 5;

const CACHE_DIR = path.join(__dirname, "../database/.tmdb-cache");
const DUMP_FILE = path.join(__dirname, "../database/seeds/tmdb.json.gz");
const CAST_FILE = path.join(__dirname, "../database/seeds/tmdb-cast.json.gz");

/* ================================================================== *
 * 2. TYPES
 * ================================================================== */

type SeedCredit = {
  person_tmdb_id: number;
  personnage_name: string | null;
  role: string;
};

type SeedPerson = {
  tmdb_id: number;
  name: string;
  biography: string | null;
  photo: string | null;
};

/** Le dump principal, lu en seule lecture. */
type SeedFile = {
  persons: { tmdb_id: number }[];
  medias: {
    tmdb_id: number;
    type: "movie" | "tv";
    is_anime: boolean;
    name: string;
    seasons: {
      number: number;
      episodes: { tmdb_id: number; number: number }[];
    }[];
  }[];
};

/** Le fichier produit par ce script. */
type CastFile = {
  generated_at: string;
  /** Acteurs absents du dump principal. */
  persons: SeedPerson[];
  /** Casting complet, par média. */
  media_cast: {
    media_tmdb_id: number;
    media_type: "movie" | "tv";
    cast: SeedCredit[];
  }[];
  /** Casting complet, par épisode. */
  episode_cast: {
    episode_tmdb_id: number;
    cast: SeedCredit[];
  }[];
};

type CastMember = {
  id: number;
  name: string;
  character?: string;
  known_for_department?: string;
  roles?: { character?: string }[];
};

/* ================================================================== *
 * 3. CLIENT HTTP
 * ================================================================== */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* --- Régulateur de débit -------------------------------------------- *
 * Chaque requête réserve un créneau de départ. Les créneaux sont
 * espacés de 1000/RATE_LIMIT millisecondes, ce qui plafonne le débit
 * quelle que soit la latence du réseau.
 */

const MIN_INTERVAL = 1000 / RATE_LIMIT;
let nextSlot = 0;

const reserveSlot = async () => {
  const now = Date.now();
  const slot = Math.max(now, nextSlot);

  nextSlot = slot + MIN_INTERVAL;

  const delay = slot - now;

  if (delay > 0) await sleep(delay);
};

/** Sur un 429, on repousse le prochain créneau pour tout le monde. */
const backOffEveryone = (seconds: number) => {
  nextSlot = Math.max(nextSlot, Date.now() + seconds * 1000);
};

/* --- Limiteur de concurrence ---------------------------------------- */

let active = 0;
const waiting: (() => void)[] = [];

const acquire = async () => {
  if (active < CONCURRENCY) {
    active += 1;
    return;
  }

  await new Promise<void>((resolve) => waiting.push(resolve));
  active += 1;
};

const release = () => {
  active -= 1;
  waiting.shift()?.();
};

/* --- Cache (optionnel) ----------------------------------------------- */

const cachePath = (key: string) => {
  // Hash léger : pas besoin de crypto pour nommer un fichier de cache.
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }

  return path.join(CACHE_DIR, `${(hash >>> 0).toString(16)}.json`);
};

const readCache = (key: string) => {
  if (!USE_CACHE) return undefined;

  const file = cachePath(key);

  if (!fs.existsSync(file)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
};

const writeCache = (key: string, value: unknown) => {
  if (!USE_CACHE) return;

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(key), JSON.stringify(value), "utf8");
};

/* --- Requête ---------------------------------------------------------- */

let requestCount = 0;
let rateLimitHits = 0;

const tmdbGet = async <T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T | null> => {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) throw new Error("TMDB_API_KEY absente du .env");

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const cacheKey = url.toString();
  const cached = readCache(cacheKey);

  if (cached !== undefined) return cached as T | null;

  url.searchParams.set("api_key", apiKey);

  await acquire();

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        await reserveSlot();

        requestCount += 1;

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (response.status === 404) {
          writeCache(cacheKey, null);
          return null;
        }

        if (response.status === 429) {
          rateLimitHits += 1;

          const retryAfter = Number(response.headers.get("retry-after") ?? 1);

          backOffEveryone(retryAfter + 1);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} sur ${endpoint}`);
        }

        const data = (await response.json()) as T;

        writeCache(cacheKey, data);

        return data;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          console.error(`✖ Échec définitif : ${endpoint}`, error);
          return null;
        }

        await sleep(500 * 2 ** attempt);
      }
    }

    return null;
  } finally {
    release();
  }
};

/* ================================================================== *
 * 4. TRAITEMENT PAR LOTS
 * ================================================================== */

/**
 * Traite les éléments par tranches, en sauvegardant entre chaque.
 * Si le script est interrompu, la relance repart de la dernière tranche
 * terminée au lieu de tout recommencer.
 */
const processInBatches = async <T, R>(
  label: string,
  items: T[],
  handler: (item: T) => Promise<R>,
  onCheckpoint: () => void,
): Promise<R[]> => {
  const results: R[] = [];
  const startedAt = Date.now();

  for (let index = 0; index < items.length; index += CHECKPOINT_EVERY) {
    const batch = items.slice(index, index + CHECKPOINT_EVERY);

    results.push(...(await Promise.all(batch.map(handler))));

    const done = results.length;
    const elapsed = (Date.now() - startedAt) / 1000;
    const rate = done / Math.max(elapsed, 1);
    const remaining = Math.round((items.length - done) / Math.max(rate, 0.1));

    console.info(
      `  ${label} : ${done}/${items.length} — ${rate.toFixed(1)}/s — reste ~${formatDuration(remaining)}`,
    );

    onCheckpoint();
  }

  return results;
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;

  return `${Math.floor(seconds / 3600)}h${String(
    Math.round((seconds % 3600) / 60),
  ).padStart(2, "0")}`;
};

/* ================================================================== *
 * 5. CASTING
 * ================================================================== */

const personIds = new Set<number>();

const orNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

/** Ne conserve que les acteurs, sans plafond, et sans doublon. */
const toCredits = (cast: CastMember[] | undefined): SeedCredit[] => {
  if (!cast) return [];

  const seen = new Set<number>();
  const credits: SeedCredit[] = [];

  for (const member of cast) {
    if (member.known_for_department !== "Acting") continue;
    if (seen.has(member.id)) continue;

    seen.add(member.id);
    personIds.add(member.id);

    credits.push({
      person_tmdb_id: member.id,
      // aggregate_credits expose les rôles dans "roles", credits dans "character"
      personnage_name: orNull(member.roles?.[0]?.character ?? member.character),
      role: "actor",
    });
  }

  return credits;
};

const movieCast = async (tmdbId: number) => {
  const data = await tmdbGet<{ cast?: CastMember[] }>(
    `/movie/${tmdbId}/credits`,
    { language: LANG },
  );

  return toCredits(data?.cast);
};

const tvCast = async (tmdbId: number) => {
  const data = await tmdbGet<{ cast?: CastMember[] }>(
    `/tv/${tmdbId}/aggregate_credits`,
    { language: LANG },
  );

  return toCredits(data?.cast);
};

const episodeCast = async (
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
) => {
  const data = await tmdbGet<{
    cast?: CastMember[];
    guest_stars?: CastMember[];
  }>(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits`);

  return toCredits([...(data?.cast ?? []), ...(data?.guest_stars ?? [])]);
};

/* ================================================================== *
 * 6. ORCHESTRATION
 * ================================================================== */

const readGzip = <T>(file: string): T =>
  JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf8"));

const writeGzip = (file: string, value: unknown, level: number) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // Écriture via un fichier temporaire : une coupure de courant au
  // mauvais moment ne laisse pas un fichier à moitié écrit.
  const temporary = `${file}.tmp`;

  fs.writeFileSync(
    temporary,
    zlib.gzipSync(Buffer.from(JSON.stringify(value), "utf8"), { level }),
  );

  fs.renameSync(temporary, file);
};

const main = async () => {
  const startedAt = Date.now();

  if (!fs.existsSync(DUMP_FILE)) {
    throw new Error(
      `Dump introuvable : ${DUMP_FILE}\nLancez d'abord "npm run tmdb:fetch".`,
    );
  }

  const dump = readGzip<SeedFile>(DUMP_FILE);

  // Reprise : ce qui a déjà été récupéré lors d'un run précédent.
  const output: CastFile = fs.existsSync(CAST_FILE)
    ? readGzip<CastFile>(CAST_FILE)
    : {
        generated_at: new Date().toISOString(),
        persons: [],
        media_cast: [],
        episode_cast: [],
      };

  const doneMedia = new Set(
    output.media_cast.map(
      (entry) => `${entry.media_type}:${entry.media_tmdb_id}`,
    ),
  );
  const doneEpisodes = new Set(
    output.episode_cast.map((entry) => entry.episode_tmdb_id),
  );

  // Les acteurs déjà connus : ceux du dump principal, plus ceux
  // récupérés lors d'un run précédent de ce script.
  const knownPersons = new Set([
    ...dump.persons.map((person) => person.tmdb_id),
    ...output.persons.map((person) => person.tmdb_id),
  ]);

  // Les crédits déjà récupérés comptent dans les personnes à traiter.
  for (const entry of [...output.media_cast, ...output.episode_cast]) {
    for (const credit of entry.cast) personIds.add(credit.person_tmdb_id);
  }

  /* --- Portée -------------------------------------------------------- */

  const targets = dump.medias.filter((media) => {
    if (ONLY_MEDIA_TMDB_IDS.length > 0) {
      return ONLY_MEDIA_TMDB_IDS.includes(media.tmdb_id);
    }

    if (media.type === "movie") return SCOPE.movies;

    return media.is_anime ? SCOPE.animes : SCOPE.series;
  });

  const mediaTasks = targets.filter(
    (media) => !doneMedia.has(`${media.type}:${media.tmdb_id}`),
  );

  const episodeTasks = targets.flatMap((media) =>
    media.seasons.flatMap((season) =>
      season.episodes
        .filter((episode) => !doneEpisodes.has(episode.tmdb_id))
        .map((episode) => ({
          tvId: media.tmdb_id,
          seasonNumber: season.number,
          episodeTmdbId: episode.tmdb_id,
          episodeNumber: episode.number,
        })),
    ),
  );

  let lastSave = Date.now();

  /**
   * Sauvegarde intermédiaire : compression rapide, et pas plus d'une
   * fois par minute. La sauvegarde finale repasse en compression
   * maximale, puisque c'est elle qui part sur Git.
   */
  const save = (force = false) => {
    const elapsed = (Date.now() - lastSave) / 1000;

    if (!force && elapsed < CHECKPOINT_MIN_INTERVAL) return;

    output.generated_at = new Date().toISOString();
    writeGzip(CAST_FILE, output, force ? 9 : 1);

    lastSave = Date.now();
  };

  /* --- Annonce ------------------------------------------------------- */

  const estimatedRequests = mediaTasks.length + episodeTasks.length;
  const estimatedSeconds = Math.round(estimatedRequests / RATE_LIMIT);

  console.info(`Dump : ${dump.medias.length} média(s)`);
  console.info(`Portée : ${targets.length} média(s)`);

  if (doneMedia.size > 0 || doneEpisodes.size > 0) {
    console.info(
      `Reprise : ${doneMedia.size} média(s) et ${doneEpisodes.size} épisode(s) déjà faits`,
    );
  }

  console.info(
    `À traiter : ${mediaTasks.length} média(s), ${episodeTasks.length} épisode(s)`,
  );
  console.info(
    `Débit visé : ${RATE_LIMIT} req/s — environ ${formatDuration(estimatedSeconds)} pour cette étape, hors fiches d'acteurs.`,
  );
  console.info(`Démarrage dans ${COUNTDOWN_SECONDS}s — Ctrl+C pour annuler.\n`);

  await sleep(COUNTDOWN_SECONDS * 1000);

  /* --- Casting des médias -------------------------------------------- */

  if (mediaTasks.length > 0) {
    console.info("① Casting des médias");

    await processInBatches(
      "Médias",
      mediaTasks,
      async (media) => {
        const cast =
          media.type === "movie"
            ? await movieCast(media.tmdb_id)
            : await tvCast(media.tmdb_id);

        output.media_cast.push({
          media_tmdb_id: media.tmdb_id,
          media_type: media.type,
          cast,
        });
      },
      save,
    );
  }

  /* --- Casting des épisodes ------------------------------------------- */

  if (episodeTasks.length > 0) {
    console.info("② Casting des épisodes");

    await processInBatches(
      "Épisodes",
      episodeTasks,
      async (task) => {
        const cast = await episodeCast(
          task.tvId,
          task.seasonNumber,
          task.episodeNumber,
        );

        output.episode_cast.push({
          episode_tmdb_id: task.episodeTmdbId,
          cast,
        });
      },
      save,
    );
  }

  /* --- Fiches des acteurs découverts ----------------------------------- */

  const newPersonIds = [...personIds].filter((id) => !knownPersons.has(id));

  console.info(
    `③ Acteurs (${personIds.size} référencés, ${newPersonIds.length} à télécharger)`,
  );

  if (newPersonIds.length > 0 && FETCH_PERSON_DETAILS) {
    await processInBatches(
      "Acteurs",
      newPersonIds,
      async (id) => {
        const detail = await tmdbGet<{
          id: number;
          name: string;
          biography?: string;
          profile_path?: string | null;
        }>(`/person/${id}`, { language: LANG });

        if (!detail) return;

        let biography = orNull(detail.biography);

        if (!biography) {
          const fallback = await tmdbGet<{ biography?: string }>(
            `/person/${id}`,
            { language: FALLBACK_LANG },
          );

          biography = orNull(fallback?.biography);
        }

        output.persons.push({
          tmdb_id: detail.id,
          name: detail.name,
          biography,
          photo: detail.profile_path ?? null,
        });
      },
      save,
    );
  } else if (newPersonIds.length > 0) {
    output.persons.push(
      ...newPersonIds.map((id) => ({
        tmdb_id: id,
        name: `#${id}`,
        biography: null,
        photo: null,
      })),
    );
  }

  save(true);

  /* --- Récapitulatif ---------------------------------------------------- */

  const stats = fs.statSync(CAST_FILE);
  const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

  const creditCount =
    output.media_cast.reduce((total, entry) => total + entry.cast.length, 0) +
    output.episode_cast.reduce((total, entry) => total + entry.cast.length, 0);

  console.info(`
✔ Terminé en ${formatDuration(Math.round((Date.now() - startedAt) / 1000))}
  Requêtes API : ${requestCount}${rateLimitHits > 0 ? ` (${rateLimitHits} ralentissement(s) 429)` : ""}
  ─────────────
  Médias       : ${output.media_cast.length}
  Épisodes     : ${output.episode_cast.length}
  Liens casting: ${creditCount}
  Acteurs ajoutés : ${output.persons.length}
  Poids        : ${mb(stats.size)} compressé
  Fichier      : ${CAST_FILE}

  Pour l'appliquer : npm run db:migrate && npm run tmdb:seed && npm run tmdbAct:seed
`);
};

main().catch((error) => {
  console.error("Échec du script :", error);
  process.exit(1);
});
