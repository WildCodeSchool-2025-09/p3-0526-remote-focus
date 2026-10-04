import { API_URL } from "../../services/api";
import type { DashboardProfile } from "../../types/Dashboard";

type ProfileHeaderProps = {
  profile: DashboardProfile;
};

function ProfileHeader({ profile }: ProfileHeaderProps) {
  const memberSince = new Date(profile.createdAt).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-4">
      <img
        src={`${API_URL}${profile.avatar}`}
        alt={profile.name}
        className="h-16 w-16 shrink-0 rounded-full object-cover md:h-20 md:w-20"
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold md:text-2xl">
          Bonjour, {profile.name}
        </h1>
        <span className="text-sm text-focus-yellow">
          Membre depuis {memberSince}
        </span>
      </div>
    </div>
  );
}

export default ProfileHeader;
