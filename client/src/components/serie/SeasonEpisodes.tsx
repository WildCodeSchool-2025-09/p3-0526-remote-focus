import { useEffect, useState } from "react";
import { fetchEpisodes } from "../../services/api";
import type { Episode } from "../../types/media";
import EpisodeList from "../EpisodeList";

type SeasonEpisodesProps = {
  seasonId: number;
};

function SeasonEpisodes({ seasonId }: SeasonEpisodesProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    fetchEpisodes(seasonId)
      .then((data) => {
        if (active) {
          setEpisodes(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Épisodes indisponibles.");
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

  if (loading) {
    return <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Chargement…</p>;
  }

  if (error != null) {
    return <p className="px-4 pb-4 text-sm text-[#9FB4BD]">{error}</p>;
  }

  if (episodes.length === 0) {
    return (
      <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Aucun épisode listé.</p>
    );
  }

  return <EpisodeList episodes={episodes} />;
}

export default SeasonEpisodes;
