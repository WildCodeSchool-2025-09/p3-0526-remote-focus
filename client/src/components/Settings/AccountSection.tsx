import Avatar from "../Avatar";
import SettingsRow from "./SettingsRow";

type AccountSectionProps = {
  login: string;
  email: string;
  avatar: string;
};

function AccountSection({ login, email, avatar }: AccountSectionProps) {
  return (
    <section className="card bg-base-200 p-6">
      <h2 className="text-lg font-semibold">Compte</h2>

      <div className="mt-4 flex items-center gap-4 border-b border-base-300 pb-4">
        <Avatar avatarPath={avatar} alt={login} size={64} />
        <button type="button" className="btn btn-ghost btn-sm" disabled>
          Changer la photo
        </button>
      </div>

      <div className="mt-2">
        <SettingsRow label="Pseudo" value={login} />
        <SettingsRow label="Email" value={email} />
        <SettingsRow label="Mot de passe" value="••••••••" />
      </div>
    </section>
  );
}

export default AccountSection;
