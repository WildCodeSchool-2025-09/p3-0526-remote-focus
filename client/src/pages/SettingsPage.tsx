import useFetch from "../hooks/useFetch";
import { useAuth } from "../contexts/AuthContext";
import AccountSection from "../components/profile/AccountSection";

type SettingsResponse = {
  profile: {
    firstname: string;
    lastname: string | null;
    email: string;
    bornAt: string;
    name: string;
    avatar: string;
    createdAt: string;
  };
  preferences: {
    darkTheme: 0 | 1;
    isPegi16: 0 | 1;
  };
};

function SettingsPage() {
  const { token } = useAuth();
  const {
    data: settings,
    loading,
    error,
  } = useFetch<SettingsResponse>(token ? "/api/me/settings" : null);

  return (
    <div className="mt-10 ml-10">
      <h1>Paramètres</h1>

      {loading && <p>Chargement…</p>}
      {error && <p>Erreur : {error}</p>}

      {settings && (
        <>
          <AccountSection profile={settings.profile} />
          <p>
            {settings.profile.firstname} {settings.profile.lastname ?? ""}
          </p>
          <p>{settings.profile.email}</p>
          <p>
            Thème sombre :{" "}
            {settings.preferences.darkTheme === 1 ? "Oui" : "Non"}
          </p>
        </>
      )}
    </div>
  );
}

export default SettingsPage;
