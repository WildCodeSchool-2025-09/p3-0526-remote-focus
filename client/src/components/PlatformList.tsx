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
      <div className="hidden h-12 w-px bg-white/15 md:block" />
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2">
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
