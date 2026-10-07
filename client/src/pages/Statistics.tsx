import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import GenreDonutChart from "../components/profile/GenreDonutChart";
import MonthlyViewingChart from "../components/profile/MonthlyViewingChart";
import StatCard from "../components/profile/StatCard";
import TopGenresList from "../components/profile/TopGenresList";
import { useAuth } from "../contexts/AuthContext";
import useFetch from "../hooks/useFetch";
import type { StatisticsResponse } from "../types/Statistics";

function Statistics() {
  const { token } = useAuth();
  const { data, loading, error } = useFetch<StatisticsResponse>(
    token ? "/api/me/statistics" : null,
  );

  return (
    <div className="space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm text-base-content"
      >
        <ChevronLeft size={16} />
        Retour
      </Link>

      <h1 className="text-2xl font-bold">Mes statistiques</h1>

      {loading && <p className="text-focus-muted">Chargement…</p>}

      {!loading && error && (
        <p className="text-focus-muted" aria-live="polite">
          Une erreur est survenue lors du chargement de vos statistiques. Merci
          d'actualiser la page.
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <StatCard label="Titres vus" value={String(data.titlesWatched)} />
            <StatCard
              label="Temps de visionnage"
              value={`${Math.round(data.totalDurationMinutes / 60)} h`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col justify-center rounded-lg border border-focus-line/20 bg-base-200 p-4 text-center">
              <h2 className="mb-4 font-semibold">Répartition par genre</h2>
              <GenreDonutChart data={data.genreDistribution} />
            </div>

            <div className="rounded-lg border border-focus-line/20 bg-base-200 p-4">
              <h2 className="mb-4 text-center font-semibold">
                Temps de visionnage par mois
              </h2>
              <MonthlyViewingChart monthlyDuration={data.monthlyDuration} />
            </div>
          </div>

          <div className="rounded-lg border border-focus-line/20 bg-base-200 p-4">
            <h2 className="mb-4 text-center font-semibold">
              Mes genres les plus regardés
            </h2>
            <TopGenresList data={data.topGenres} />
          </div>
        </>
      )}
    </div>
  );
}

export default Statistics;
