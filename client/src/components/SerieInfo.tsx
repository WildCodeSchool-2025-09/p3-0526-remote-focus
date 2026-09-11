import type { Series } from "../types/media";

type SerieInfoProps = {
  series: Series;
};

function SerieInfo({ series }: SerieInfoProps) {
  if (series.synopsis == null) {
    return null;
  }

  return (
    <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
      {series.synopsis}
    </p>
  );
}

export default SerieInfo;
