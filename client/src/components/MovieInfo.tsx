import type { Media } from "../types/media";

type MovieInfoProps = {
  media: Media;
};

function MovieInfo({ media }: MovieInfoProps) {
  if (media.synopsis == null) {
    return null;
  }

  return (
    <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
      {media.synopsis}
    </p>
  );
}

export default MovieInfo;
