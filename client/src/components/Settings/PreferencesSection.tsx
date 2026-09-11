import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updatePegiFilter } from "../../services/api";

type PreferencesSectionProps = {
  initialIsPegi16: boolean;
};

function PreferencesSection({ initialIsPegi16 }: PreferencesSectionProps) {
  const { token, updateUser } = useAuth();
  const [draftIsPegi16, setDraftIsPegi16] = useState(initialIsPegi16);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = draftIsPegi16 !== initialIsPegi16;

  const handleSave = async () => {
    if (token == null) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const user = await updatePegiFilter(draftIsPegi16, token);
      updateUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftIsPegi16(initialIsPegi16);
    setError(null);
  };

  return (
    <section className="card bg-base-200 mt-6 p-6">
      <h2 className="text-lg font-semibold">Préférences</h2>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Thème sombre</p>
            <p className="text-focus-muted-dark text-sm">
              Non disponible (thème clair à venir)
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked
            disabled
            readOnly
            aria-label="Thème sombre"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Filtre PEGI 16+</p>
            <p className="text-focus-muted-dark text-sm">
              Masque les contenus classés 16 ans et plus
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={draftIsPegi16}
            onChange={(event) => setDraftIsPegi16(event.target.checked)}
            aria-label="Filtre PEGI 16+"
          />
        </div>
      </div>

      {error != null && <p className="text-error mt-4 text-sm">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleCancel}
          disabled={!isDirty || isSaving}
        >
          Annuler
        </button>
      </div>
    </section>
  );
}

export default PreferencesSection;
