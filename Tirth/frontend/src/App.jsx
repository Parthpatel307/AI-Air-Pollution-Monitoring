import {
  useEffect,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
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


function HashScrollHandler() {
  const location =
    useLocation();


  useEffect(() => {
    if (
      !location.hash
    ) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      return;
    }


    const sectionId =
      decodeURIComponent(
        location.hash.substring(
          1
        )
      );


    let attempts = 0;


    function tryScroll() {
      const target =
        document.getElementById(
          sectionId
        );


      if (target) {
        target.scrollIntoView({
          behavior:
            "smooth",

          block:
            "start",
        });

        return true;
      }


      return false;
    }


    if (
      tryScroll()
    ) {
      return;
    }


    const timer =
      window.setInterval(
        () => {
          attempts += 1;


          if (
            tryScroll() ||
            attempts >= 50
          ) {
            window.clearInterval(
              timer
            );
          }
        },
        100
      );


    return () => {
      window.clearInterval(
        timer
      );
    };

  }, [
    location.pathname,
    location.hash,
  ]);


  return null;
}


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

      <HashScrollHandler />


      <Routes>

        {/* PUBLIC ENTRY */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/citizen-auth"
          element={
            <CitizenAuth />
          }
        />


        <Route
          path="/authority-login"
          element={
            <AuthorityLogin />
          }
        />


        {/* AUTHENTICATED APP */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />


          <Route
            path="/compare"
            element={
              <CompareZones />
            }
          />


          <Route
            path="/history"
            element={
              <History />
            }
          />


          {/* CITIZEN ONLY */}

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


          {/* AUTHORITY / ADMIN */}

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


        {/* UNKNOWN ROUTES */}

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