import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import PageContainer from "./components/layout/PageContainer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/Login";
import CitizenAuth from "./pages/CitizenAuth";
import AuthorityLogin from "./pages/AuthorityLogin";

import Dashboard from "./pages/Dashboard";
import CompareZones from "./pages/CompareZones";
import History from "./pages/History";
import CitizenView from "./pages/CitizenView";
import AuthorityMode from "./pages/AuthorityMode";
import EvidenceAnalysis from "./pages/EvidenceAnalysis";

function AppLayout() {
  return (
    <>
      <Header />
      <Sidebar />

      <PageContainer>
        <Outlet />
      </PageContainer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/citizen-auth"
          element={<CitizenAuth />}
        />

        <Route
          path="/authority-login"
          element={<AuthorityLogin />}
        />

        {/* =========================
            AUTHENTICATED APP
        ========================== */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/compare"
            element={<CompareZones />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          {/* =========================
              CITIZEN ONLY
          ========================== */}

          <Route
            path="/citizen"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "CITIZEN",
                ]}
              >
                <CitizenView />
              </ProtectedRoute>
            }
          />

          {/* =========================
              AUTHORITY / ADMIN ONLY
          ========================== */}

          <Route
            path="/authority"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "AUTHORITY",
                  "ADMIN",
                ]}
              >
                <AuthorityMode />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evidence"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "AUTHORITY",
                  "ADMIN",
                ]}
              >
                <EvidenceAnalysis />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* =========================
            UNKNOWN ROUTES
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;