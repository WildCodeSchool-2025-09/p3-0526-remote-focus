function PreferencesSection() {
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
            disabled
            aria-label="Filtre PEGI 16+"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" className="btn btn-primary" disabled>
          Enregistrer
        </button>
        <button type="button" className="btn btn-ghost" disabled>
          Annuler
        </button>
      </div>
    </section>
  );
}

export default PreferencesSection;
