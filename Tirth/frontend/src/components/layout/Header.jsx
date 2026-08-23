import {
  Activity,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();

  const {
    selectedZone,
    setSelectedZone,
  } = useAppContext();

  const {
    user,
    logout,
    isCitizen,
    isAuthority,
  } = useAuth();

  async function handleLogout() {
    try {
      await logout();

      navigate(
        "/login",
        { replace: true }
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  const roleLabel =
    user?.role === "ADMIN"
      ? "Admin"
      : isAuthority
      ? "Authority"
      : isCitizen
      ? "Citizen"
      : "User";

  return (
    <header className="topbar">
      {/* BRAND */}

      <div className="brand-block">
        <div className="brand-mark">
          <Activity
            size={21}
            strokeWidth={2.3}
          />
        </div>

        <div>
          <strong>
            AirGuard AI
          </strong>

          <span>
            Environmental Intelligence Network
          </span>
        </div>
      </div>

      {/* CONTROLS */}

      <div className="topbar-controls">
        <div className="system-status">
          <span className="status-dot" />

          SYSTEM ONLINE
        </div>

        {/* ZONE */}

        <label className="control-field zone-control">
          <span className="control-label">
            <MapPin size={14} />
            ZONE
          </span>

          <select
            value={selectedZone}
            onChange={(event) =>
              setSelectedZone(
                event.target.value
              )
            }
          >
            <option value="zone_001">
              Ahmedabad
            </option>

            <option value="zone_002">
              Gandhinagar
            </option>

            <option value="zone_003">
              Vadodara
            </option>
          </select>
        </label>

        {/* CURRENT AUTH ROLE */}

        <div
          className={
            isAuthority
              ? "current-role authority-role"
              : "current-role citizen-role"
          }
        >
          {isAuthority ? (
            <ShieldCheck size={16} />
          ) : (
            <UserRound size={16} />
          )}

          <div>
            <span>
              ACCESS ROLE
            </span>

            <strong>
              {roleLabel}
            </strong>
          </div>
        </div>

        {/* USER */}

        <div className="header-user">
          <div className="header-user-avatar">
            {user?.email
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="header-user-copy">
            <span>
              SIGNED IN
            </span>

            <strong>
              {user?.email ||
                user?.name ||
                "Authenticated User"}
            </strong>
          </div>
        </div>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={16} />

          <span>
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;