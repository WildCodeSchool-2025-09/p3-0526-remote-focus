import type { SettingsPreferences } from "../../types/Dashboard";

interface PreferencesSectionProps {
  preferences: SettingsPreferences;
  onPegiChange: () => void;
}

function PreferencesSection({
  preferences,
  onPegiChange,
}: PreferencesSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3>Préférences</h3>
      <div className="bg-focus-surface input input-bordered flex justify-between items-center py-9">
        <div>
          <p className="font-bold">Thème sombre</p>
          <p className="font-light text-xs">
            Non disponible (thème clair à venir)
          </p>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-secondary"
          checked={preferences.darkTheme === 1}
          disabled
        />
      </div>
      <div className="bg-focus-surface input input-bordered flex justify-between items-center py-9">
        <div>
          <p className="font-bold">Filtre PEGI 16+</p>
          <p className="font-light text-xs text-focus-muted">
            Masquer les contenus déconseillés aux moins de 16 ans
          </p>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-secondary"
          checked={preferences.isPegi16 === 1}
          onChange={onPegiChange}
        />
      </div>
    </div>
  );
}

export default PreferencesSection;
