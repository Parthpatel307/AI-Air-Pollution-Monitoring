import {
  useState,
} from "react";

import {
  LayoutDashboard,
  GitCompareArrows,
  History,
  Users,
  ShieldAlert,
  ScanSearch,
  RadioTower,
  Satellite,
  Bot,
  ChevronDown,
  TrendingUp,
  BarChart3,
  CalendarDays,
  AlertTriangle,
  UploadCloud,
  FileText,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


function Sidebar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  const {
    user,
    isCitizen,
    isAuthority,
  } = useAuth();


  function getInitialMenu() {
    if (!location.hash) {
      return "";
    }

    if (
      location.pathname ===
      "/dashboard"
    ) {
      return "overview";
    }

    if (
      location.pathname ===
      "/compare"
    ) {
      return "compare";
    }

    if (
      location.pathname ===
      "/history"
    ) {
      return "history";
    }

    if (
      location.pathname ===
      "/citizen"
    ) {
      return "citizen";
    }

    return "";
  }


  const [
    openMenu,
    setOpenMenu,
  ] = useState(
    getInitialMenu
  );


  const overviewChildren = [
    {
      label:
        "Live Monitoring",

      section:
        "live-monitoring",

      icon:
        RadioTower,
    },
    {
      label:
        "Forecast & Risk",

      section:
        "forecast-risk",

      icon:
        TrendingUp,
    },
    {
      label:
        "Satellite Intelligence",

      section:
        "satellite-intelligence",

      icon:
        Satellite,
    },
    {
      label:
        "AI Intelligence",

      section:
        "ai-intelligence",

      icon:
        Bot,
    },
  ];


  const compareChildren = [
    {
      label:
        "Zone Selection",

      section:
        "compare-zone-selection",

      icon:
        GitCompareArrows,
    },
    {
      label:
        "Direct Comparison",

      section:
        "compare-direct-comparison",

      icon:
        TrendingUp,
    },
    {
      label:
        "Visual Comparison",

      section:
        "compare-visual-comparison",

      icon:
        BarChart3,
    },
  ];


  const historyChildren = [
    {
      label:
        "History Overview",

      section:
        "history-overview",

      icon:
        History,
    },
    {
      label:
        "AQI Trend",

      section:
        "history-aqi-trend",

      icon:
        TrendingUp,
    },
    {
      label:
        "Historical Readings",

      section:
        "history-readings",

      icon:
        CalendarDays,
    },
  ];


  const citizenChildren = [
    {
      label:
        "Local Alerts",

      section:
        "citizen-alerts",

      icon:
        AlertTriangle,
    },
    {
      label:
        "Report Pollution",

      section:
        "citizen-report",

      icon:
        FileText,
    },
    {
      label:
        "Add Evidence",

      section:
        "citizen-evidence",

      icon:
        UploadCloud,
    },
  ];


  const commonNavigation = [
    {
      key:
        "overview",

      label:
        "Overview",

      path:
        "/dashboard",

      icon:
        LayoutDashboard,

      children:
        overviewChildren,
    },
    {
      key:
        "compare",

      label:
        "Compare Zones",

      path:
        "/compare",

      icon:
        GitCompareArrows,

      children:
        compareChildren,
    },
    {
      key:
        "history",

      label:
        "History",

      path:
        "/history",

      icon:
        History,

      children:
        historyChildren,
    },
  ];


  const citizenNavigation = [
    {
      key:
        "citizen",

      label:
        "Citizen Portal",

      path:
        "/citizen",

      icon:
        Users,

      children:
        citizenChildren,
    },
  ];


  const authorityNavigation = [
    {
      key:
        "authority",

      label:
        "Incident Command",

      path:
        "/authority",

      icon:
        ShieldAlert,
    },
    {
      key:
        "evidence",

      label:
        "Evidence AI",

      path:
        "/evidence",

      icon:
        ScanSearch,
    },
  ];


  let navigation = [
    ...commonNavigation,
  ];


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


  function toggleMenu(
    key
  ) {
    setOpenMenu(
      (current) =>
        current === key
          ? ""
          : key
    );
  }


  function jumpToSection(
    item,
    child
  ) {
    setOpenMenu(
      item.key
    );

    navigate(
      `${item.path}#${child.section}`
    );
  }


  function isChildActive(
    item,
    child
  ) {
    return (
      location.pathname ===
        item.path &&
      location.hash ===
        `#${child.section}`
    );
  }


  function getSubmenuStyle(
    active
  ) {
    return {
      width:
        "100%",

      display:
        "flex",

      alignItems:
        "center",

      gap:
        "9px",

      padding:
        "8px 10px",

      borderRadius:
        "9px",

      border:
        active
          ? "1px solid rgba(45,212,191,.22)"
          : "1px solid transparent",

      background:
        active
          ? "rgba(45,212,191,.08)"
          : "transparent",

      color:
        active
          ? "#5eead4"
          : "#76918b",

      fontSize:
        "11px",

      fontWeight:
        600,

      textAlign:
        "left",

      cursor:
        "pointer",

      transition:
        "all .2s ease",
    };
  }


  return (
    <aside className="sidebar">

      <div className="sidebar-label">
        ENVIRONMENT INTELLIGENCE
      </div>


      <nav>
        {navigation.map(
          (item) => {
            const Icon =
              item.icon;

            const hasChildren =
              Array.isArray(
                item.children
              ) &&
              item.children
                .length > 0;

            const expanded =
              openMenu ===
              item.key;


            return (
              <div
                key={
                  item.key
                }
              >

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >

                  <NavLink
                    to={
                      item.path
                    }
                    end
                    style={
                      hasChildren
                        ? {
                            paddingRight:
                              "48px",
                          }
                        : undefined
                    }
                    className={({
                      isActive,
                    }) =>
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
                      {
                        item.label
                      }
                    </span>

                  </NavLink>


                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleMenu(
                          item.key
                        )
                      }
                      aria-label={`Toggle ${item.label} submenu`}
                      title={
                        expanded
                          ? "Hide submenu"
                          : "Show submenu"
                      }
                      style={{
                        position:
                          "absolute",

                        right:
                          "10px",

                        top:
                          "50%",

                        transform:
                          `translateY(-50%) rotate(${
                            expanded
                              ? "180deg"
                              : "0deg"
                          })`,

                        width:
                          "30px",

                        height:
                          "30px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        padding:
                          0,

                        border:
                          "none",

                        borderRadius:
                          "8px",

                        background:
                          expanded
                            ? "rgba(45,212,191,.09)"
                            : "transparent",

                        color:
                          expanded
                            ? "#5eead4"
                            : "#708d86",

                        cursor:
                          "pointer",

                        transition:
                          "all .2s ease",
                      }}
                    >
                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                      />
                    </button>
                  )}

                </div>


                {hasChildren &&
                  expanded && (
                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "3px",

                      margin:
                        "6px 7px 14px 42px",

                      padding:
                        "4px 0 4px 10px",

                      borderLeft:
                        "1px solid rgba(94,234,212,.14)",
                    }}
                  >

                    {item.children.map(
                      (
                        child
                      ) => {
                        const ChildIcon =
                          child.icon;

                        const active =
                          isChildActive(
                            item,
                            child
                          );


                        return (
                          <button
                            key={
                              child.section
                            }
                            type="button"
                            onClick={() =>
                              jumpToSection(
                                item,
                                child
                              )
                            }
                            style={
                              getSubmenuStyle(
                                active
                              )
                            }
                          >
                            <ChildIcon
                              size={14}
                              strokeWidth={2}
                            />

                            <span>
                              {
                                child.label
                              }
                            </span>
                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            );
          }
        )}
      </nav>


      <div className="sidebar-footer">

        <span>
          {user?.role ===
          "ADMIN"
            ? "ADMIN NETWORK"
            : isAuthority
            ? "AUTHORITY NETWORK"
            : isCitizen
            ? "CITIZEN NETWORK"
            : "MONITORING NETWORK"}
        </span>


        <strong>
          <RadioTower
            size={14}
          />

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