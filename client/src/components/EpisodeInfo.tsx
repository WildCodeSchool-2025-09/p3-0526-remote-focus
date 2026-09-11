import type { EpisodeDetail } from "../types/media";

type EpisodeInfoProps = {
  episode: EpisodeDetail;
};

function EpisodeInfo({ episode }: EpisodeInfoProps) {
  if (episode.synopsis == null) {
    return null;
  }

  return (
    <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
      {episode.synopsis}
    </p>
  );
}

export default EpisodeInfo;
