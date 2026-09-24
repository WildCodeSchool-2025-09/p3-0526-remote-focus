import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeList from "../components/EpisodeList";
import KnownFrom from "../components/KnownFrom";
import SeasonHeader from "../components/season/SeasonHeader";
import { fetchSeason } from "../services/api";
import type { SeasonDetail as SeasonDetailType } from "../types/media";

function SeasonDetail() {
  const { seasonId } = useParams();

  const [seasonDetail, setSeasonDetail] = useState<SeasonDetailType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (seasonId == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchSeason(Number(seasonId))
      .then((data) => {
        if (active) {
          setSeasonDetail(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Cette saison est introuvable.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [seasonId]);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId(personId);
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || seasonDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/catalog" },
          seasonDetail.serie.isAnime
            ? { label: "Animés", to: "/catalog?type=anime" }
            : { label: "Séries", to: "/catalog?type=tv" },
          {
            label: seasonDetail.serie.name,
            to: `/${seasonDetail.serie.isAnime ? "animes" : "series"}/${seasonDetail.serie.id}`,
          },
          { label: `Saison ${seasonDetail.number}` },
        ]}
      />
      <SeasonHeader season={seasonDetail} />
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold md:text-2xl">Épisodes</h2>
        <div className="overflow-hidden rounded-xl border border-white/15">
          <EpisodeList episodes={seasonDetail.episodes} />
        </div>
      </section>
      <CastList
        cast={seasonDetail.cast}
        castTotal={seasonDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <KnownFrom
          personId={selectedPersonId}
          mediaId={seasonDetail.serie.id}
        />
      )}
    </div>
  );
}

export default SeasonDetail;
