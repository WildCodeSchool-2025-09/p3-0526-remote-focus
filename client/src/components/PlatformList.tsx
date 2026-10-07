import type { Platform } from "../types/media";

type PlatformListProps = {
  platforms: Platform[];
};

function PlatformList({ platforms }: PlatformListProps) {
  if (platforms.length === 0) {
    return null;
  }

  return (
    <>
      <div className="hidden h-12 w-px bg-base-content/15 md:block" />
      <div className="flex items-center gap-2 rounded-lg border border-base-content/15 bg-base-200 p-2">
        {platforms.map((platform) => (
          <img
            key={platform.id}
            src={`https://image.tmdb.org/t/p/w92${platform.logo}`}
            alt={platform.name}
            title={platform.name}
            className="h-8 w-8 rounded object-contain"
          />
        ))}
      </div>
    </>
  );
}

export default PlatformList;
