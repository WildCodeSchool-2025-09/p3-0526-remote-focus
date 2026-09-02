import "./globals.css";

function App() {
  return (
    <>
      <div className="min-h-screen bg-base-100 p-8 space-y-4">
        <h1 className="text-4xl">Focus</h1>
        <p className="text-focus-muted">Texte secondaire en Inter.</p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-primary">
            Primaire
          </button>
          <button type="button" className="btn btn-secondary">
            Secondaire
          </button>
          <button type="button" className="btn btn-accent">
            Accent
          </button>
        </div>
        <div className="card bg-base-200 p-6">Surface de card</div>
      </div>
    </>
  );
}

export default App;
