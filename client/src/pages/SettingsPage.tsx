import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import AccountSection from "../components/profile/AccountSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import { useAuth } from "../contexts/AuthContext";
import useFetch from "../hooks/useFetch";

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

  const [formData, setFormData] = useState<SettingsResponse | null>(null);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  function handleProfileChange(changes: Partial<SettingsResponse["profile"]>) {
    setFormData((current) =>
      current
        ? { ...current, profile: { ...current.profile, ...changes } }
        : current,
    );
  }

  function handlePegi() {
    if (formData) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          isPegi16: formData.preferences.isPegi16 === 0 ? 1 : 0,
        },
      });
    }
  }

  function handleSave() {
    if (!settings || !formData) return;

    if (settings.preferences.isPegi16 !== formData.preferences.isPegi16) {
      // TODO : appeler l'API de l'US qui modifiera le PEGI
    }
  }

  return (
    <div className="mt-10 md:ml-4">
      <div className="flex w-full justify-end px-4 py-6">
        <BackButton />
      </div>
      <h1>Paramètres</h1>

      {loading && <p>Chargement…</p>}
      {error && <p>Erreur : {error}</p>}

      {settings && formData && (
        <>
          <AccountSection
            profile={formData.profile}
            onProfileChange={handleProfileChange}
          />
          <PreferencesSection
            preferences={formData.preferences}
            onPegiChange={handlePegi}
          />
          <div className="flex gap-4 mt-6 justify-center md:justify-start">
            <button
              type="button"
              aria-label="Enregistrer les changements"
              className="w-32 btn bg-warning py-2.5 text-center text-sm font-semibold text-warning-content transition hover:brightness-95 hover:text-focus-cream"
              onClick={handleSave}
            >
              Enregistrer
            </button>
            <button
              type="button"
              aria-label="Annuler les changements"
              className="w-32 btn py-2.5 text-center text-sm font-semibold text-focus-muted"
              onClick={() => setFormData(settings)}
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SettingsPage;
