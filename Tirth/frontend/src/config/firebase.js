import {
  initializeApp,
} from "firebase/app";

import {
  initializeAuth,
  browserSessionPersistence,
} from "firebase/auth";


const firebaseConfig = {
  apiKey:
    "AIzaSyBkFBhsJSkm1z_CNGEn1ycXKEd7gRmUs7s",

  authDomain:
    "ai-air-pollution-monitor-31c6c.firebaseapp.com",

  projectId:
    "ai-air-pollution-monitor-31c6c",

  storageBucket:
    "ai-air-pollution-monitor-31c6c.firebasestorage.app",

  messagingSenderId:
    "95258887145",

  appId:
    "1:95258887145:web:53674291d2e8f472b88178",
};


const app =
  initializeApp(
    firebaseConfig
  );


/*
 * Firebase authentication persistence:
 *
 * browserSessionPersistence
 *
 * Login stays active while the current
 * browser/tab session is open.
 *
 * After the browser/tab session ends,
 * the user must login again.
 *
 * This prevents an old Vaibhav/Citizen/
 * Authority account from automatically
 * opening later from permanent storage.
 */
export const auth =
  initializeAuth(
    app,
    {
      persistence:
        browserSessionPersistence,
    }
  );


export default app;