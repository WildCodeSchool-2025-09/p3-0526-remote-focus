import type { Media } from "../types/media";

type MediaInfoProps = {
    media: Media;
};

function MediaInfo({ media }: MediaInfoProps) {
    if (media.synopsis == null) {
        return null;
    }

    return (
        <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
            {media.synopsis}
        </p>
    );
}

export default MediaInfo;