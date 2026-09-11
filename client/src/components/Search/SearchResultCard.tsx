import { Star } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { importMedia } from "../../services/api";
import type { SearchMedia } from "../../types/Search";
import { formatRating } from "../../utils/formatRating";
import { getMediaPath } from "../../utils/mediaPath";
import MediaCardActions from "../MediaCardActions";

type SearchResultCardProps = {
  media: SearchMedia;
};

function SearchResultCard({ media }: SearchResultCardProps) {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(false);

  const year = media.releasedAt
    ? new Date(media.releasedAt).getFullYear()
    : null;

  const handleImportClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (media.tmdbId == null) {
      return;
    }

    setImporting(true);
    setImportError(false);

    try {
      const result = await importMedia(media.type, media.tmdbId);
      navigate(getMediaPath(result.type, result.id));
    } catch {
      setImportError(true);
    } finally {
      setImporting(false);
    }
  };

  const poster =
    media.poster != null ? (
      <img
        src={`https://image.tmdb.org/t/p/w342${media.poster}`}
        alt={media.name}
        className="h-[180px] w-[120px] rounded-lg object-cover md:h-[255px] md:w-[170px]"
      />
    ) : (
      <div className="h-[180px] w-[120px] rounded-lg bg-white/10 md:h-[255px] md:w-[170px]" />
    );

  const info = (
    <div className="flex flex-col gap-0.5">
      <span className="text-base font-semibold">{media.name}</span>
      <span className="text-focus-muted-dark flex items-center gap-1 text-sm">
        {year != null && <span>{year}</span>}
        {media.overallRating != null && (
          <span className="flex items-center gap-1">
            <Star fill="#F2B705" color="#F2B705" size={12} />
            {formatRating(media.overallRating)}
          </span>
        )}
        {media.pegi != null && (
          <span className="badge badge-outline badge-sm">
            PEGI {media.pegi}
          </span>
        )}
      </span>
    </div>
  );

  if (media.imported === false || media.id == null) {
    return (
      <button
        type="button"
        onClick={handleImportClick}
        disabled={importing}
        className="relative flex w-[120px] shrink-0 flex-col gap-2 text-left md:w-[170px]"
      >
        <span className="badge badge-primary badge-sm absolute left-1 top-1 z-10">
          TMDB
        </span>
        <div className="relative">
          {poster}
          {importing && (
            <span className="loading loading-spinner loading-sm absolute inset-0 m-auto text-primary" />
          )}
        </div>
        {info}
        {importError && (
          <span className="text-error text-xs">
            Échec de l'import, réessayez.
          </span>
        )}
      </button>
    );
  }

  return (
    <Link
      to={getMediaPath(media.type, media.id)}
      className="relative flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]"
    >
      <MediaCardActions mediaId={media.id} mediaType={media.type} />
      {poster}
      {info}
    </Link>
  );
}

export default SearchResultCard;
