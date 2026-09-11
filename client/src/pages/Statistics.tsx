import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { fetchStatistics } from "../services/api";
import type { StatisticsData } from "../types/Profile";
import { formatDuration } from "../utils/formatDuration";

const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

const GENRE_COLORS = ["#F2B705", "#17B890", "#E83658"];
const GENRE_OPACITIES = [1, 0.7, 0.45];

function genreColor(index: number): string {
  const baseColor = GENRE_COLORS[index % GENRE_COLORS.length];
  const opacity =
    GENRE_OPACITIES[
      Math.floor(index / GENRE_COLORS.length) % GENRE_OPACITIES.length
    ];
  return opacity === 1
    ? baseColor
    : `${baseColor}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
}

function Statistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token == null) {
      return;
    }

    let active = true;

    fetchStatistics(token)
      .then((data) => {
        if (active) {
          setStats(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <span className="loading loading-spinner text-primary mt-8" />;
  }

  if (error || stats == null) {
    return (
      <p className="text-error mt-8">
        Impossible de charger vos statistiques, réessayez plus tard.
      </p>
    );
  }

  const monthlyData = stats.monthlyWatchTimeMinutes.map((minutes, index) => ({
    month: MONTH_LABELS[index],
    minutes,
  }));

  return (
    <div>
      <h1>Mes statistiques</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-2">
        <div className="card bg-base-200 p-6">
          <span className="text-3xl font-bold">{stats.watchedTitles}</span>
          <span className="text-focus-muted-dark text-sm">
            Titres vus au total
          </span>
        </div>
        <div className="card bg-base-200 p-6">
          <span className="text-3xl font-bold">
            {stats.watchTimeMinutes > 0
              ? formatDuration(stats.watchTimeMinutes)
              : "0 min"}
          </span>
          <span className="text-focus-muted-dark text-sm">
            Temps de visionnage total
          </span>
        </div>
      </div>

      <section className="mt-9">
        <h2 className="mb-4 text-lg font-semibold">
          Temps de visionnage par mois ({new Date().getFullYear()})
        </h2>
        <div className="card bg-base-200 h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="month" stroke="#F5F5F0" />
              <YAxis stroke="#F5F5F0" />
              <Tooltip
                formatter={(value) => [
                  formatDuration(Number(value)) || "0 min",
                  "Visionné",
                ]}
                contentStyle={{ background: "#0F242F", border: "none" }}
              />
              <Bar dataKey="minutes" fill="#F2B705" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-9">
        <h2 className="mb-4 text-lg font-semibold">
          Mes genres les plus regardés
        </h2>

        {stats.genreBreakdown.length === 0 ? (
          <p className="text-focus-muted-dark">
            Marquez des médias comme vus pour voir apparaître la répartition par
            genre ici.
          </p>
        ) : (
          <div className="card bg-base-200 h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.genreBreakdown}
                  dataKey="percentage"
                  nameKey="genreName"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {stats.genreBreakdown.map((entry, index) => (
                    <Cell key={entry.genreId} fill={genreColor(index)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${value}% (${item.payload.count})`,
                    item.payload.genreName,
                  ]}
                  contentStyle={{ background: "#0F242F", border: "none" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

export default Statistics;
