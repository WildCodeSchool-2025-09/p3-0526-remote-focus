import { ChevronDown, Power } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../contexts/AuthContext";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current !== null &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (user === null) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen((currentValue) => !currentValue);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  const initial = user.firstName.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="profile-menu"
        aria-label={`Menu du profil de ${user.firstName}`}
        className="flex items-center gap-2 rounded-full border border-focus-line/30 bg-base-200 p-1 transition hover:border-focus-line/60 lg:pr-3"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-warning text-xs font-semibold text-warning-content"
        >
          {initial}
        </span>

        <span className="hidden text-sm font-semibold text-base-content lg:inline">
          {user.firstName}
        </span>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`hidden text-base-content/60 transition lg:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="profile-menu"
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-box border border-focus-line/30 bg-base-200 p-2 shadow-xl"
        >
          <p className="truncate px-3 py-2 text-xs text-base-content/60">
            {user.email}
          </p>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-error transition hover:bg-error/10"
          >
            <Power size={16} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
