import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Logo from "../components/common/Logo";
import { useAuth } from "../context/AuthContext";

function AuthorityLogin() {
  const navigate = useNavigate();

  const {
    login,
    logout,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim();

    if (
      !normalizedEmail ||
      !password
    ) {
      setError(
        "Please enter your official email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const appUser =
        await login(
          normalizedEmail,
          password
        );

      const authorized =
        appUser?.role ===
          "AUTHORITY" ||
        appUser?.role ===
          "ADMIN";

      if (!authorized) {
        await logout();

        setError(
          "This Firebase account is not authorized for Authority access."
        );

        return;
      }

      navigate(
        "/authority",
        { replace: true }
      );
    } catch (authError) {
      console.error(
        "Authority authentication failed:",
        authError
      );

      const code =
        authError?.code || "";

      if (
        code ===
          "auth/invalid-credential" ||
        code ===
          "auth/wrong-password" ||
        code ===
          "auth/user-not-found"
      ) {
        setError(
          "Invalid official email or password."
        );
      } else if (
        code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many login attempts. Please wait and try again."
        );
      } else if (
        authError?.message
      ) {
        setError(
          authError.message
        );
      } else {
        setError(
          "Authority authentication failed."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authority-auth-page">
      {/* LEFT SIDE */}

      <section className="authority-auth-brand">
        <div className="authority-auth-logo">
          <Logo />
        </div>

        <div className="authority-auth-brand-content">
          <span className="authority-auth-kicker">
            AUTHORIZED ENVIRONMENTAL OPERATIONS
          </span>

          <h1>
            Environmental
            <span>
              {" "}Command Access
            </span>
          </h1>

          <p>
            Restricted operational access
            for verified environmental
            authorities and response teams.
          </p>

          <div className="authority-auth-benefits">
            <div>
              <ShieldCheck size={19} />

              <span>
                Protected authority
                operations
              </span>
            </div>

            <div>
              <BadgeCheck size={19} />

              <span>
                Firebase verified operator
                identity
              </span>
            </div>

            <div>
              <LockKeyhole size={19} />

              <span>
                Role-based access control
              </span>
            </div>
          </div>
        </div>

        <div className="authority-auth-network">
          <span className="status-dot" />

          Authority monitoring network online
        </div>
      </section>

      {/* RIGHT SIDE */}

      <section className="authority-auth-panel">
        <div className="authority-auth-box">
          <Link
            to="/login"
            className="authority-auth-back"
          >
            ← Operational Mode
          </Link>

          <div className="authority-auth-heading">
            <span>
              RESTRICTED ACCESS
            </span>

            <h2>
              Authority Sign In
            </h2>

            <p>
              Use an existing authorized
              Firebase account to continue.
            </p>
          </div>

          <div className="authority-security-banner">
            <ShieldCheck size={18} />

            <div>
              <strong>
                Verified accounts only
              </strong>

              <span>
                AUTHORITY or ADMIN role
                claim is required.
              </span>
            </div>
          </div>

          <form
            className="authority-auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Official email

              <div className="authority-auth-input">
                <Mail size={17} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="officer@example.gov"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </label>

            <label>
              Password

              <div className="authority-auth-input">
                <LockKeyhole
                  size={17}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter secure password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="authority-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </label>

            {error && (
              <div
                className="authority-auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="authority-auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Verifying authority access..."
                  : "Enter Authority Command"}
              </span>

              {!loading && (
                <ArrowRight
                  size={18}
                />
              )}
            </button>
          </form>

          <div className="authority-no-signup">
            <ShieldCheck size={16} />

            <p>
              Public Authority registration
              is disabled. Authority and
              Admin roles are provisioned
              only through trusted
              server-side administration.
            </p>
          </div>

          <div className="authority-citizen-link">
            <span>
              Citizen access?
            </span>

            <Link to="/citizen-auth">
              Citizen Sign In →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuthorityLogin;