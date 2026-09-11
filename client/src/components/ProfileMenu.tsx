import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarFailed, setAvatarFailed] = useState(false);

  if (user == null) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-circle avatar"
        aria-label="Menu profil"
      >
        <div className="flex w-9 items-center justify-center overflow-hidden rounded-full bg-base-300">
          {avatarFailed ? (
            <UserIcon size={18} />
          ) : (
            <img
              src={`${API_URL}${user.avatar}`}
              alt={user.login}
              onError={() => setAvatarFailed(true)}
            />
          )}
        </div>
      </button>

      <ul
        // biome-ignore lint/a11y/noNoninteractiveTabindex: DaisyUI dropdown pattern needs tabIndex on the content to stay open via :focus-within
        tabIndex={0}
        className="menu dropdown-content z-10 mt-3 w-48 rounded-box bg-base-200 p-2 shadow"
      >
        <li>
          <Link to="/profile">
            <UserIcon size={16} />
            Profil
          </Link>
        </li>
        <li>
          <button type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileMenu;
