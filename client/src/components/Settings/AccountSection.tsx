import { useState } from "react";
import Avatar from "../Avatar";
import EditAvatarModal from "./EditAvatarModal";
import EditEmailModal from "./EditEmailModal";
import EditLoginModal from "./EditLoginModal";
import EditPasswordModal from "./EditPasswordModal";
import SettingsRow from "./SettingsRow";

type AccountSectionProps = {
  login: string;
  email: string;
  avatar: string;
};

type ActiveModal = "login" | "email" | "password" | "avatar" | null;

function AccountSection({ login, email, avatar }: AccountSectionProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  return (
    <section className="card bg-base-200 p-6">
      <h2 className="text-lg font-semibold">Compte</h2>

      <div className="mt-4 flex items-center gap-4 border-b border-base-300 pb-4">
        <Avatar avatarPath={avatar} alt={login} size={64} />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveModal("avatar")}
        >
          Changer la photo
        </button>
      </div>

      <div className="mt-2">
        <SettingsRow
          label="Pseudo"
          value={login}
          onEdit={() => setActiveModal("login")}
        />
        <SettingsRow
          label="Email"
          value={email}
          onEdit={() => setActiveModal("email")}
        />
        <SettingsRow
          label="Mot de passe"
          value="••••••••"
          onEdit={() => setActiveModal("password")}
        />
      </div>

      {activeModal === "login" && (
        <EditLoginModal
          currentLogin={login}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "email" && (
        <EditEmailModal
          currentEmail={email}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "password" && (
        <EditPasswordModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "avatar" && (
        <EditAvatarModal onClose={() => setActiveModal(null)} />
      )}
    </section>
  );
}

export default AccountSection;
