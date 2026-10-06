import { CameraIcon } from "lucide-react";
import { API_URL } from "../../services/api";
import type { SettingsProfile } from "../../types/Dashboard";

interface AccountSectionProps {
  profile: SettingsProfile;
}

function AccountSection({ profile }: AccountSectionProps) {
  return (
    <>
      <div className="flex gap-4 md:gap-10 items-center my-6">
        <img
          src={`${API_URL}${profile.avatar}`}
          alt={profile.name}
          className="h-16 w-16 shrink-0 rounded-full object-cover md:h-20 md:w-20"
        />
        <button
          type="button"
          className="btn flex justify-center items-center px-6 border-focus-cream bg-focus-void"
          aria-label="Changer la photo"
        >
          <CameraIcon size={18} />
          Changer la photo
        </button>
        {/* TODO US-PRO-08 = Les champs suivants peuvent être séparés dans un composant.
        Je te laisse voir ce qui sera le plus pratique pour toi !*/}
      </div>
      <div>
        <h3 className="my-6 mt-14">Compte</h3>
        <div>
          <label htmlFor="pseudo" className="text-focus-muted">
            Pseudo
          </label>
          <div className="flex mt-2 mb-6 flex-col items-start gap-4 lg:flex-row">
            <input
              type="text"
              name="pseudo"
              className="input input-bordered bg-focus-surface w-2/3"
              value={`${profile.name}`}
            />
            <button
              type="button"
              className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
              aria-label="Modifier le Pseudo"
            >
              Modifier
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-focus-muted">
            Email
          </label>
          <div className="flex mt-2 mb-6 flex-col items-start gap-4 lg:flex-row">
            <input
              type="text"
              name="email"
              className="input input-bordered bg-focus-surface w-2/3"
              value={`${profile.email}`}
            />
            <button
              type="button"
              className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
              aria-label="Modifier le Mail"
            >
              Modifier
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="password" className="text-focus-muted">
            Mot de passe
          </label>
          <div className="border-b border-focus-line/20 pb-6 flex mt-2 mb-6 flex-col items-start gap-4 lg:flex-row">
            <input
              type="text"
              name="password"
              className="input input-bordered bg-focus-surface w-2/3"
              value="****"
            />
            <button
              type="button"
              className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
              aria-label="Modifier le Mot de passe"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSection;
