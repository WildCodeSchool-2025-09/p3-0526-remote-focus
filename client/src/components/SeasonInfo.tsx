import type { SeasonDetail } from "../types/media";

type SeasonInfoProps = {
  season: SeasonDetail;
};

function SeasonInfo({ season }: SeasonInfoProps) {
  if (season.synopsis == null) {
    return null;
  }

  return (
    <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
      {season.synopsis}
    </p>
  );
}

export default SeasonInfo;
