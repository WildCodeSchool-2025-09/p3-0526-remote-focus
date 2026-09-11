import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GenreSelector from "../components/GenreSelector";
import { useAuth } from "../contexts/AuthContext";
import { fetchGenres, saveGenrePreferences } from "../services/api";
import type { Genre } from "../types/media";

function Preferences() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (genreId: number) => {
    setSelectedGenres((current) =>
      current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId],
    );
  };

  const handleValidate = async () => {
    if (token == null) {
      navigate("/");
      return;
    }

    setIsSaving(true);

    try {
      await saveGenrePreferences(selectedGenres, token);
    } finally {
      setIsSaving(false);
      navigate("/");
    }
  };

  const handleConfirmSkip = () => {
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Vos genres préférés</h1>
      <p className="text-focus-muted-dark mb-6 text-sm">
        Sélectionnez les genres que vous aimez pour des recommandations plus
        pertinentes.
      </p>

      {loading && <span className="loading loading-spinner text-primary" />}

      {!loading && error && (
        <p className="text-error">
          Impossible de charger les genres, réessayez plus tard.
        </p>
      )}

      {!loading && !error && (
        <>
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenres}
            onToggle={handleToggle}
          />

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleValidate}
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : "Valider"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowSkipConfirm(true)}
            >
              Passer cette étape
            </button>
          </div>
        </>
      )}

      {showSkipConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              Passer la sélection de genres ?
            </h3>
            <p className="py-4">
              Sans préférences, vos recommandations seront moins personnalisées.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowSkipConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSkip}
              >
                Continuer sans préférences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Preferences;
