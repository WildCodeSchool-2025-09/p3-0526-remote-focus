import { useParams } from "react-router";
import useFetch from "../hooks/useFetch";
import type { EpisodeDetail as EpisodeDetailType } from "../types/media";

function EpisodeDetail() {
  const { seriesId, seasonId, episodeId } = useParams();

  const {
    data: episodeDetail,
    loading,
    error,
  } = useFetch<EpisodeDetailType>(
    seriesId != null && seasonId != null && episodeId != null
      ? `/api/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}`
      : null,
  );

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || episodeDetail == null) {
    return <p className="p-8 text-focus-muted">Cet épisode est introuvable.</p>;
  }

  return null;
}

export default EpisodeDetail;
