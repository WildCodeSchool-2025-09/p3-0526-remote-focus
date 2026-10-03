import {
  BarChart3,
  Bookmark,
  ChevronRight,
  Heart,
  Settings,
  User,
} from "lucide-react";
import { Link } from "react-router";
import DashboardCard from "../components/profile/DashboardCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import useFetch from "../hooks/useFetch";
import type { DashboardData } from "../types/Dashboard";

function Profile() {
  const { data, loading, error } = useFetch<DashboardData>("/api/me/dashboard");

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || data == null) {
    return (
      <p className="p-8 text-focus-muted">
        Une erreur est survenue lors du chargement du profil. Merci d'actualiser
        la page.
      </p>
    );
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4">
      <div className="flex items-center justify-between gap-4">
        <ProfileHeader profile={data.profile} />

        <Link
          to="/profile/settings"
          aria-label="Paramètres"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-[#F2B705] hover:text-[#F2B705] lg:flex"
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

      <div className="lg:hidden">
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
      </div>
    </div>
  );
}

export default Profile;
