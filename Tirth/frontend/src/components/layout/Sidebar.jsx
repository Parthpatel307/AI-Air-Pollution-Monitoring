import {
  LayoutDashboard,
  GitCompareArrows,
  History,
  Users,
  ShieldAlert,
  ScanSearch,
  RadioTower,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const {
    user,
    isCitizen,
    isAuthority,
  } = useAuth();

  const commonNavigation = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Compare Zones",
      path: "/compare",
      icon: GitCompareArrows,
    },
    {
      label: "History",
      path: "/history",
      icon: History,
    },
  ];

  const citizenNavigation = [
    {
      label: "Citizen Portal",
      path: "/citizen",
      icon: Users,
    },
  ];

  const authorityNavigation = [
    {
      label: "Incident Command",
      path: "/authority",
      icon: ShieldAlert,
    },
    {
      label: "Evidence AI",
      path: "/evidence",
      icon: ScanSearch,
    },
  ];

  let navigation = [...commonNavigation];

  if (isCitizen) {
    navigation = [
      ...navigation,
      ...citizenNavigation,
    ];
  }

  if (isAuthority) {
    navigation = [
      ...navigation,
      ...authorityNavigation,
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-label">
        ENVIRONMENT INTELLIGENCE
      </div>

      <nav>
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-icon">
                <Icon
                  size={19}
                  strokeWidth={2}
                />
              </span>

              <span className="sidebar-text">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>
          {user?.role === "ADMIN"
            ? "ADMIN NETWORK"
            : isAuthority
            ? "AUTHORITY NETWORK"
            : isCitizen
            ? "CITIZEN NETWORK"
            : "MONITORING NETWORK"}
        </span>

        <strong>
          <RadioTower size={14} />
          CONNECTED
        </strong>

        {user && (
          <small className="sidebar-user">
            {user.email ||
              user.name ||
              user.uid}
          </small>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;