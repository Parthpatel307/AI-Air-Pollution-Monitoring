import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Logo from "../components/common/Logo";

function CitizenAuth() {
  const navigate = useNavigate();

  const {
    login,
    citizenSignup,
    logout,
  } = useAuth();

  const [authMode, setAuthMode] =
    useState("login");

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function switchMode(mode) {
    setAuthMode(mode);
    setError("");

    setForm((previous) => ({
      ...previous,
      password: "",
      confirmPassword: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (
      authMode === "signup" &&
      form.password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      authMode === "signup" &&
      form.password !== form.confirmPassword
    ) {
      setError(
        "Password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      if (authMode === "signup") {
        // AuthContext flow:
        //
        // Firebase signup
        //      ↓
        // Firebase ID token
        //      ↓
        // POST /auth/provision-citizen
        //      ↓
        // Force token refresh
        //      ↓
        // Verify role=CITIZEN

        const appUser =
          await citizenSignup(
            email,
            form.password
          );

        if (
          appUser?.role !== "CITIZEN"
        ) {
          await logout();

          throw new Error(
            "Citizen access could not be verified."
          );
        }

        navigate(
          "/citizen",
          { replace: true }
        );

        return;
      }

      // Existing Firebase login flow
      const appUser =
        await login(
          email,
          form.password
        );

      if (
        appUser?.role !== "CITIZEN"
      ) {
        await logout();

        setError(
          "This account does not have Citizen access."
        );

        return;
      }

      navigate(
        "/citizen",
        { replace: true }
      );
    } catch (authError) {
      console.error(
        "Citizen authentication failed:",
        authError
      );

      const code =
        authError?.code || "";

      if (
        code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "An account already exists with this email. Please sign in instead."
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
          "auth/invalid-credential" ||
        code ===
          "auth/wrong-password" ||
        code ===
          "auth/user-not-found"
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        code ===
        "auth/weak-password"
      ) {
        setError(
          "Please choose a stronger password."
        );
      } else if (
        code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many attempts. Please wait and try again."
        );
      } else if (
        authError?.message
      ) {
        setError(
          authError.message
        );
      } else {
        setError(
          "Authentication failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="citizen-auth-page">
      {/* LEFT SIDE */}

      <section className="citizen-auth-brand">
        <div className="citizen-auth-logo">
          <Logo />
        </div>

        <div className="citizen-auth-brand-content">
          <span className="citizen-auth-kicker">
            COMMUNITY ENVIRONMENT NETWORK
          </span>

          <h1>
            Cleaner air starts with
            <span> better awareness.</span>
          </h1>

          <p>
            Access local air-quality
            intelligence, receive safety
            alerts and contribute verified
            environmental observations from
            your community.
          </p>

          <div className="citizen-auth-benefits">
            <div>
              <ShieldCheck size={19} />

              <span>
                Secure Firebase
                authentication
              </span>
            </div>

            <div>
              <UserRound size={19} />

              <span>
                Citizen environmental
                reporting
              </span>
            </div>

            <div>
              <LockKeyhole size={19} />

              <span>
                Protected evidence and
                account access
              </span>
            </div>
          </div>
        </div>

        <div className="citizen-auth-network">
          <span className="status-dot" />

          Environmental intelligence
          network online
        </div>
      </section>

      {/* RIGHT SIDE */}

      <section className="citizen-auth-panel">
        <div className="citizen-auth-box">
          <Link
            to="/login"
            className="citizen-auth-back"
          >
            ← Operational Mode
          </Link>

          <div className="citizen-auth-heading">
            <span>
              CITIZEN ACCESS
            </span>

            <h2>
              {authMode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Sign in to access your Citizen Intelligence workspace."
                : "Join the AirGuard community environmental network."}
            </p>
          </div>

          {/* TABS */}

          <div className="citizen-auth-tabs">
            <button
              type="button"
              className={
                authMode === "login"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode("login")
              }
            >
              Sign In
            </button>

            <button
              type="button"
              className={
                authMode === "signup"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode("signup")
              }
            >
              Create Account
            </button>
          </div>

          <form
            className="citizen-auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address

              <div className="citizen-auth-input">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </label>

            <label>
              Password

              <div className="citizen-auth-input">
                <LockKeyhole size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    authMode === "signup"
                      ? "Minimum 6 characters"
                      : "Enter your password"
                  }
                  autoComplete={
                    authMode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="citizen-password-toggle"
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

            {authMode === "signup" && (
              <label>
                Confirm password

                <div className="citizen-auth-input">
                  <LockKeyhole
                    size={17}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </label>
            )}

            {error && (
              <div
                className="citizen-auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="citizen-auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? authMode === "signup"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "signup"
                  ? "Create Citizen Account"
                  : "Enter Citizen Portal"}
              </span>

              {!loading && (
                <ArrowRight
                  size={18}
                />
              )}
            </button>
          </form>

          {authMode === "signup" && (
            <div className="citizen-auth-security">
              <ShieldCheck size={16} />

              <p>
                New public accounts receive
                Citizen access only.
                Authority and Admin access
                cannot be requested from
                this page.
              </p>
            </div>
          )}

          <div className="citizen-authority-link">
            <span>
              Environmental authority?
            </span>

            <Link to="/authority-login">
              Authority Sign In →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CitizenAuth;