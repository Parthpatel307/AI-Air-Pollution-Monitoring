import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkFBhsJSkm1z_CNGEn1ycXKEd7gRmUs7s",
  authDomain: "ai-air-pollution-monitor-31c6c.firebaseapp.com",
  projectId: "ai-air-pollution-monitor-31c6c",
  storageBucket: "ai-air-pollution-monitor-31c6c.firebasestorage.app",
  messagingSenderId: "95258887145",
  appId: "1:95258887145:web:53674291d2e8f472b88178",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;