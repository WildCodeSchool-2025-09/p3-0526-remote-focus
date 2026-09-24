import useFetch from "../../hooks/useFetch";
import type { Episode } from "../../types/media";
import EpisodeList from "../EpisodeList";

type SeasonEpisodesProps = {
  serieId: number;
  seasonId: number;
};

function SeasonEpisodes({ serieId, seasonId }: SeasonEpisodesProps) {
  const {
    data: episodes,
    loading,
    error,
  } = useFetch<Episode[]>(
    `/api/series/${serieId}/seasons/${seasonId}/episodes`,
  );

  if (loading) {
    return <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Chargement…</p>;
  }

  if (error != null || episodes == null) {
    return (
      <p className="px-4 pb-4 text-sm text-[#9FB4BD]">
        Épisodes indisponibles.
      </p>
    );
  }

  if (episodes.length === 0) {
    return (
      <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Aucun épisode listé.</p>
    );
  }

  return <EpisodeList episodes={episodes} />;
}

export default SeasonEpisodes;
