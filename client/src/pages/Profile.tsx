import { BarChart3, Bookmark, Heart, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Avatar from "../components/Avatar";
import DashboardCard from "../components/Profile/DashboardCard";
import { useAuth } from "../contexts/AuthContext";
import { fetchDashboard } from "../services/api";
import type { DashboardData } from "../types/Profile";

function Profile() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token == null) {
      return;
    }

    let active = true;

    fetchDashboard(token)
      .then((data) => {
        if (active) {
          setDashboard(data);
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

  if (error || dashboard == null) {
    return (
      <p className="text-error mt-8">
        Impossible de charger votre profil, réessayez plus tard.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            avatarPath={dashboard.user.avatar}
            alt={dashboard.user.login}
            size={64}
          />
          <h1 className="text-2xl font-bold">{dashboard.user.firstname}</h1>
        </div>

        <Link
          to="/profile/settings"
          className="btn btn-ghost btn-circle"
          aria-label="Paramètres"
        >
          <Settings size={20} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardCard
          icon={Heart}
          label="Favoris"
          count={dashboard.counts.favorites}
          to="/profile/favorites"
        />
        <DashboardCard
          icon={Bookmark}
          label="Watchlist"
          count={dashboard.counts.watchlist}
          to="/profile/watchlist"
        />
        <DashboardCard
          icon={User}
          label="Mes acteurs favoris"
          count={dashboard.counts.favoriteActors}
          to="/profile/actors"
        />
        <DashboardCard
          icon={BarChart3}
          label="Statistiques"
          count={dashboard.counts.watchedTitles}
          to="/profile/statistics"
        />
      </div>
    </div>
  );
}

export default Profile;
