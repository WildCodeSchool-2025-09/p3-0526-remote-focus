import {
  BarChart3,
  Bookmark,
  ChevronDown,
  CircleUserRound,
  Heart,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../services/api";

const DEFAULT_AVATAR = "/assets/images/default-avatar.svg";

const LINKS = [
  { to: "/profile", label: "Profil", icon: CircleUserRound },
  { to: "/profile/favorites", label: "Favoris", icon: Heart },
  { to: "/profile/watchlist", label: "Watchlist", icon: Bookmark },
  { to: "/profile/actors", label: "Mes Acteurs", icon: Users },
  { to: "/profile/statistics", label: "Statistiques", icon: BarChart3 },
  { to: "/profile/settings", label: "Réglages", icon: Settings },
];

function AccountMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current != null &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (user == null) {
    return null;
  }

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full border border-base-content/40 py-1 pr-3 pl-1 text-sm font-semibold text-base-content transition hover:bg-base-200"
      >
        <img
          src={`${API_URL}${user.avatar ?? DEFAULT_AVATAR}`}
          alt={user.firstName}
          className="h-7 w-7 rounded-full object-cover"
        />
        <span className="hidden sm:inline">{user.firstName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-lg border border-focus-line/20 bg-base-100 shadow-lg">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content transition hover:bg-base-200"
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-focus-line/20 px-4 py-2.5 text-left text-sm text-[#E83658] transition hover:bg-base-200"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
