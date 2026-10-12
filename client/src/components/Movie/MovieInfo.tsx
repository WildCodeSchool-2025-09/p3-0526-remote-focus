import type { Media } from "../../types/media";
import ExpandableText from "../ExpandableText";

type MovieInfoProps = {
  media: Media;
};

function MovieInfo({ media }: MovieInfoProps) {
  if (media.synopsis == null) {
    return null;
  }

  return <ExpandableText text={media.synopsis} />;
}

export default MovieInfo;
