import { CameraIcon } from "lucide-react";
import { API_URL } from "../../services/api";
import type { SettingsProfile } from "../../types/Dashboard";

function AccountSection({ profile }: SettingsProfile) {
  return (
    <>
      <div className="flex gap-10 items-center my-6">
        <img
          src={`${API_URL}${profile.avatar}`}
          alt={profile.name}
          className="h-16 w-16 shrink-0 rounded-full object-cover md:h-20 md:w-20"
        />
        <button
          type="button"
          className="btn flex justify-center items-center px-6 border-focus-cream bg-focus-void"
        >
          <CameraIcon size={18} />
          Changer la photo
        </button>
      </div>
      <div>
        <h3 className="my-6">Compte</h3>
      </div>
    </>
  );
}

export default AccountSection;
