import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRyCSEYZKFKP5upe3OXK4_AHj4LiNhGaQ",
  authDomain: "cofounder-a6898.firebaseapp.com",
  projectId: "cofounder-a6898",
  storageBucket: "cofounder-a6898.firebasestorage.app",
  messagingSenderId: "673232146530",
  appId: "1:673232146530:web:67a199bf913e632a64c13b",
  measurementId: "G-48NZPFY0K9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
