import {
  Activity,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppContext,
} from "../../context/AppContext";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useZones,
} from "../../hooks/useZones";


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

  const {
    zones,
    loading: zonesLoading,
    error: zonesError,
  } = useZones();


  /*
   * -------------------------------------------------------
   * Clean + sort zones for dropdown
   * -------------------------------------------------------
   */

  const zoneOptions = useMemo(() => {
    const uniqueZones = new Map();

    zones.forEach((zone) => {
      const zoneId =
        zone?.zone_id;

      if (!zoneId) {
        return;
      }

      const zoneName =
        zone?.zone_name ||
        zone?.name ||
        zone?.city ||
        zoneId;

      uniqueZones.set(
        zoneId,
        {
          id: zoneId,
          name: zoneName,
        }
      );
    });

    return Array.from(
      uniqueZones.values()
    ).sort((a, b) =>
      a.name.localeCompare(
        b.name
      )
    );
  }, [zones]);


  /*
   * -------------------------------------------------------
   * Keep selected zone valid
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (
      zoneOptions.length === 0
    ) {
      return;
    }

    const selectedExists =
      zoneOptions.some(
        (zone) =>
          zone.id === selectedZone
      );

    if (!selectedExists) {
      setSelectedZone(
        zoneOptions[0].id
      );
    }
  }, [
    zoneOptions,
    selectedZone,
    setSelectedZone,
  ]);


  /*
   * -------------------------------------------------------
   * Logout
   * -------------------------------------------------------
   */

  async function handleLogout() {
    try {
      await logout();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }


  /*
   * -------------------------------------------------------
   * Role label
   * -------------------------------------------------------
   */

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
            value={selectedZone || ""}
            disabled={
              zonesLoading &&
              zoneOptions.length === 0
            }
            onChange={(event) =>
              setSelectedZone(
                event.target.value
              )
            }
            title={
              zonesError ||
              "Select monitoring zone"
            }
          >

            {zonesLoading &&
              zoneOptions.length === 0 && (
                <option
                  value={
                    selectedZone || ""
                  }
                >
                  Loading zones...
                </option>
              )}


            {!zonesLoading &&
              zoneOptions.length === 0 && (
                <option
                  value={
                    selectedZone || ""
                  }
                >
                  No zones available
                </option>
              )}


            {zoneOptions.map(
              (zone) => (
                <option
                  key={zone.id}
                  value={zone.id}
                >
                  {zone.name}
                </option>
              )
            )}

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
            <ShieldCheck
              size={16}
            />
          ) : (
            <UserRound
              size={16}
            />
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
              ?.toUpperCase() ||
              "U"}
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