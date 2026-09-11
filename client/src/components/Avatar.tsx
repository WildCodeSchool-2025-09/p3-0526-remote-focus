import { User as UserIcon } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

type AvatarProps = {
  avatarPath: string;
  alt: string;
  size?: number;
  className?: string;
};

function Avatar({ avatarPath, alt, size = 36, className = "" }: AvatarProps) {
  const [trackedPath, setTrackedPath] = useState(avatarPath);
  const [failed, setFailed] = useState(false);

  if (avatarPath !== trackedPath) {
    setTrackedPath(avatarPath);
    setFailed(false);
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-base-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <UserIcon size={Math.round(size * 0.55)} />
      ) : (
        <img
          src={`${API_URL}${avatarPath}`}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default Avatar;
