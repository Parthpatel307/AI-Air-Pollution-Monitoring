import { useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="access-page">
      <div className="access-brand">
        <Logo />
      </div>

      <div className="access-top-grid">
        <div className="access-hero">
          <div className="access-badge">
            ENVIRONMENTAL ACCESS PORTAL
          </div>

          <h1>
            Choose Your
            <span>Operational Mode</span>
          </h1>

          <p>
            Monitor. Report. Respond.
            <br />
            Choose how you want to enter the AirGuard intelligence network.
          </p>
        </div>

        <div className="access-network-panel">
          <span className="card-kicker">AIRGUARD NETWORK</span>

          <h3>Environmental Intelligence Online</h3>

          <div className="network-item">
            <span className="status-dot" />
            3 monitoring zones connected
          </div>

          <div className="network-item">
            <span className="status-dot warning-dot" />
            2 active pollution alerts
          </div>

          <div className="network-item">
            <span className="status-dot" />
            AI monitoring services ready
          </div>
        </div>
      </div>

      <div className="access-grid">
        <button
          type="button"
          className="access-card citizen-access-card"
          onClick={() => navigate("/citizen-auth")}
        >
          <div className="access-card-top">
            <div className="access-icon">C</div>

            <span className="access-status">
              PUBLIC ACCESS
            </span>
          </div>

          <div className="access-card-content">
            <span className="access-code">MODE 01</span>

            <h2>Citizen Intelligence</h2>

            <p>
              Monitor local air quality, receive safety alerts,
              report incidents and submit environmental evidence.
            </p>
          </div>

          <div className="access-features">
            <span>Live AQI</span>
            <span>Alerts</span>
            <span>Reports</span>
            <span>Evidence</span>
          </div>

          <div className="access-enter">
            <span>LOGIN / SIGN UP</span>
            <strong>→</strong>
          </div>
        </button>

        <button
          type="button"
          className="access-card authority-access-card"
          onClick={() => navigate("/authority-login")}
        >
          <div className="access-card-top">
            <div className="access-icon">A</div>

            <span className="access-status authority-status">
              RESTRICTED
            </span>
          </div>

          <div className="access-card-content">
            <span className="access-code">MODE 02</span>

            <h2>Authority Command</h2>

            <p>
              Review incidents, inspect citizen evidence,
              access AI analysis and coordinate environmental response.
            </p>
          </div>

          <div className="access-features">
            <span>Incidents</span>
            <span>Evidence AI</span>
            <span>Analysis</span>
            <span>Actions</span>
          </div>

          <div className="access-enter">
            <span>SECURE AUTHORITY LOGIN</span>
            <strong>→</strong>
          </div>
        </button>
      </div>

      <div className="access-footer">
        <span className="status-dot" />
        Secure environmental intelligence platform
      </div>
    </div>
  );
}

export default Login;