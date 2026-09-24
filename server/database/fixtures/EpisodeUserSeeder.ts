// server/database/fixtures/EpisodeUserSeeder.ts
import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

type EpisodeRow = {
  ID: number;
  ID_media: number;
  season_number: number;
  episode_number: number;
};

const HOUR_MS = 60 * 60 * 1000;

class EpisodeUserSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "episode_user",
      truncate: true,
      dependencies: [UserSeeder],
    });
  }

  async run() {
    const [rows] = await database.query<Rows>(
      `select e.ID, s.ID_media, s.number as season_number, e.number as episode_number
       from episode e
       join season s on e.ID_season = s.ID
       order by s.ID_media, s.number, e.number`,
    );

    const episodeRows = rows as EpisodeRow[];

    if (episodeRows.length === 0) {
      throw new Error(
        "Aucun épisode en base : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    const episodesByMedia = new Map<number, number[]>();

    for (const row of episodeRows) {
      const list = episodesByMedia.get(row.ID_media) ?? [];
      list.push(row.ID);
      episodesByMedia.set(row.ID_media, list);
    }

    const mediaIds = [...episodesByMedia.keys()];
    const now = Date.now();

    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const seriesSampleSize = this.faker.number.int({ min: 2, max: 5 });
      const followedMediaIds = this.faker.helpers.arrayElements(
        mediaIds,
        Math.min(seriesSampleSize, mediaIds.length),
      );

      for (const mediaId of followedMediaIds) {
        const orderedEpisodes = episodesByMedia.get(mediaId) ?? [];

        // Progression depuis le premier épisode, sans trou. watchedCount peut
        // atteindre orderedEpisodes.length : une série à une saison entièrement
        // vue signifie que tous ses épisodes (donc toute la série) sont trackés.
        const watchedCount = this.faker.number.int({
          min: 1,
          max: orderedEpisodes.length,
        });

        const watchedEpisodes = orderedEpisodes.slice(0, watchedCount);

        // Point de départ du visionnage, assez loin dans le passé pour laisser
        // de la place à la progression sans dépasser "maintenant".
        let viewedAt = this.faker.date.recent({
          days: 180 + watchedEpisodes.length * 3,
        });

        for (const episodeId of watchedEpisodes) {
          // Chaque épisode suivant est vu quelques heures à 3 jours après le précédent
          const incrementMs =
            this.faker.number.int({ min: 1, max: 72 }) * HOUR_MS;
          const nextViewedAt = new Date(viewedAt.getTime() + incrementMs);

          // Filet de sécurité : ne jamais dépasser la date actuelle
          viewedAt =
            nextViewedAt.getTime() > now ? new Date(now) : nextViewedAt;

          // Variable intermédiaire obligatoire : évite le excess property check
          const fakeEpisodeUser = {
            ID_user: userId,
            ID_episode: episodeId,
            viewed_at: viewedAt,
          };

          this.insert(fakeEpisodeUser);
        }
      }
    }
  }
}

export default EpisodeUserSeeder;
