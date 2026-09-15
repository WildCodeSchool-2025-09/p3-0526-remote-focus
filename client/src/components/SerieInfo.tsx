import type { Serie } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

type SerieInfoProps = {
  serie: Serie;
};

function SerieInfo({ serie }: SerieInfoProps) {
  return (
    <div className="flex flex-col gap-3">
      {serie.synopsis != null && (
        <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
          {serie.synopsis}
        </p>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#9FB4BD]">
        {serie.totalDuration != null && (
          <span>Durée totale : {formatDuration(serie.totalDuration)}</span>
        )}
        {serie.averageEpisodeDuration != null && (
          <span>
            Épisode : {formatDuration(serie.averageEpisodeDuration)} en moyenne
          </span>
        )}
        {serie.episodeCount > 0 && (
          <span>
            {serie.episodeCount} épisode{serie.episodeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default SerieInfo;
