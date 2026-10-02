import {
  BarChart3,
  Bookmark,
  ChevronRight,
  Heart,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Link } from "react-router";
import DashboardCard from "../components/profile/DashboardCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import { useAuth } from "../contexts/AuthContext";
import useFetch from "../hooks/useFetch";
import type { DashboardData } from "../types/Dashboard";

function Profile() {
  const { data, loading, error } = useFetch<DashboardData>("/api/me/dashboard");
  const { logout } = useAuth();

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || data == null) {
    return (
      <p className="p-8 text-focus-muted">Impossible de charger le profil.</p>
    );
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4">
      <div className="flex items-center justify-between gap-4">
        <ProfileHeader profile={data.profile} />

        <Link
          to="/profile/settings"
          aria-label="Paramètres"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-[#F2B705] hover:text-[#F2B705]"
        >
          <Settings size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard
          to="/profile/favorites"
          icon={Heart}
          iconColor="#E83658"
          title="Favoris"
          subtitle={`${data.counts.favorites} titres`}
        />
        <DashboardCard
          to="/profile/watchlist"
          icon={Bookmark}
          iconColor="#F2B705"
          title="Watchlist"
          subtitle={`${data.counts.watchlist} titres`}
        />
        <DashboardCard
          to="/profile/actors"
          icon={User}
          iconColor="#17B890"
          title="Mes Acteurs"
          subtitle={`${data.counts.actors} suivis`}
        />
        <DashboardCard
          to="/profile/statistics"
          icon={BarChart3}
          iconColor="#2E6373"
          title="Statistiques"
          subtitle="voir mon activité"
        />
      </div>

      <div className="flex flex-col gap-2 lg:hidden">
        <Link
          to="/profile/settings"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-base-200 px-4 py-3"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Settings size={16} />
            Paramètres
          </span>
          <ChevronRight size={16} />
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-left font-semibold text-[#E83658]"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Profile;
