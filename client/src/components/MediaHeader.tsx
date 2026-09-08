import type { Media } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

type MediaHeaderProps = {
    media: Media;
};

function MediaHeader({ media }: MediaHeaderProps) {
    const year = media.releasedAt
        ? new Date(media.releasedAt).getFullYear()
        : null;

    return (
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            {media.poster != null && (
                <img
                    src={`https://image.tmdb.org/t/p/w500${media.poster}`}
                    alt={media.name}
                    className="w-32 h-48 shrink-0 rounded-lg object-cover md:w-66 md:h-99"
                />
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-4">
                <h1 className="text-2xl font-bold md:text-4xl">{media.name}</h1>

                <div className="flex flex-wrap items-center gap-2">
                    {media.genres.map((genre) => (
                        <span
                            key={genre.ID}
                            className="rounded-full border border-white/30 px-4 py-2 text-sm"
                        >
                            {genre.name}
                        </span>
                    ))}

                    {year != null && (
                        <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
                            {year}
                        </span>
                    )}

                    {media.originalLanguage != null && (
                        <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
                            VO : {media.originalLanguage.toUpperCase()}
                        </span>
                    )}

                    {media.duration != null && (
                        <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
                            {formatDuration(media.duration)}
                        </span>
                    )}

                    {media.overallRating != null && (
                        <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
                            ★ {media.overallRating}
                        </span>
                    )}

                    {media.pegi != null && (
                        <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
                            PEGI {media.pegi}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MediaHeader;