import { useParams } from "react-router";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeList from "../components/EpisodeList";
import SeasonHeader from "../components/Season/SeasonHeader";
import { useWatch } from "../contexts/WatchingContext";
import useFetch from "../hooks/useFetch";
import useSelectedActor from "../hooks/useSelectedActor";
import { fetchSeasonCast } from "../services/api";
import type { SeasonDetail as SeasonDetailType } from "../types/media";

function SeasonDetail() {
  const { seriesId, seasonId } = useParams();

  const {
    data: seasonDetail,
    loading,
    error,
  } = useFetch<SeasonDetailType>(
    seriesId != null && seasonId != null
      ? `/api/series/${seriesId}/seasons/${seasonId}`
      : null,
  );
  const { selectedPersonId, handleSelectPerson, handleCloseActorWidget } =
    useSelectedActor();

  const { isEpisodeWatched } = useWatch();

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || seasonDetail == null) {
    return (
      <p className="p-8 text-focus-muted">Cette saison est introuvable.</p>
    );
  }
  const isSeasonComplete =
    seasonDetail.episodes.length > 0 &&
    seasonDetail.episodes.every((episode) => isEpisodeWatched(episode.id));

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
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
        <BackButton />
      </div>
      <SeasonHeader season={seasonDetail} isSeasonComplete={isSeasonComplete} />
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold md:text-2xl">Épisodes</h2>
        <div className="overflow-hidden rounded-xl border border-base-content/15">
          <EpisodeList
            episodes={seasonDetail.episodes}
            seriesId={seasonDetail.serie.id}
            seasonId={seasonDetail.id}
          />
        </div>
      </section>
      <CastList
        cast={seasonDetail.cast}
        castTotal={seasonDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
        fetchMore={(page) =>
          fetchSeasonCast(seasonDetail.serie.id, seasonDetail.id, { page })
        }
      />
      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          mediaId={seasonDetail.serie.id}
          onClose={handleCloseActorWidget}
        />
      )}
    </div>
  );
}

export default SeasonDetail;
