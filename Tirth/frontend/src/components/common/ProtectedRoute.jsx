import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="route-loading-page">
        <div className="loading-spinner" />

        <strong>
          Verifying secure access...
        </strong>

        <span>
          Checking Firebase authentication session
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "CITIZEN") {
      return (
        <Navigate
          to="/citizen"
          replace
        />
      );
    }

    if (
      user.role === "AUTHORITY" ||
      user.role === "ADMIN"
    ) {
      return (
        <Navigate
          to="/authority"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;