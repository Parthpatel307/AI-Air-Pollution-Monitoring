import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";

import { auth } from "../config/firebase";

const AuthContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function buildUser(firebaseUser, forceRefresh = false) {
    if (forceRefresh) {
      await firebaseUser.getIdToken(true);
    }

    const tokenResult = await getIdTokenResult(
      firebaseUser,
      forceRefresh
    );

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "User",
      role: tokenResult.claims.role || null,
    };
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            setUser(null);
            return;
          }

          const appUser = await buildUser(
            firebaseUser,
            false
          );

          setUser(appUser);
        } catch (error) {
          console.error(
            "Firebase session restore failed:",
            error
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  async function provisionCitizen(firebaseUser) {
    const idToken =
      await firebaseUser.getIdToken();

    const response = await fetch(
      `${API_BASE_URL}/auth/provision-citizen`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      throw new Error(
        result?.detail ||
          result?.error?.message ||
          "Citizen role provisioning failed."
      );
    }

    return result;
  }

  async function citizenSignup(email, password) {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const firebaseUser = credential.user;

    try {
      // Backend provisions:
      // { role: "CITIZEN" }
      //
      // Frontend sends only Firebase ID token.
      // No UID or role is sent.

      await provisionCitizen(firebaseUser);

      // Force-refresh token so new custom claim
      // becomes available on frontend.
      await firebaseUser.getIdToken(true);

      const tokenResult =
        await getIdTokenResult(
          firebaseUser,
          true
        );

      const role =
        tokenResult.claims.role || null;

      if (role !== "CITIZEN") {
        throw new Error(
          "Citizen account was created, but the CITIZEN role could not be verified."
        );
      }

      const appUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "Citizen User",
        role,
      };

      setUser(appUser);

      return appUser;
    } catch (error) {
      console.error(
        "Citizen signup provisioning failed:",
        error
      );

      throw error;
    }
  }

  async function login(email, password) {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const appUser =
      await buildUser(
        credential.user,
        true
      );

    setUser(appUser);

    return appUser;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  async function getToken(forceRefresh = false) {
    if (!auth.currentUser) {
      return null;
    }

    return auth.currentUser.getIdToken(
      forceRefresh
    );
  }

  const isCitizen =
    user?.role === "CITIZEN";

  const isAuthority =
    user?.role === "AUTHORITY" ||
    user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        citizenSignup,
        login,
        logout,
        getToken,

        isCitizen,
        isAuthority,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}