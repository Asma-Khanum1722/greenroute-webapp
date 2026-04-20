import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDwtQ7X3JWp3za5eqybo60Wq0jCMqGlkt0",
  authDomain: "greenroute-fyp.firebaseapp.com",
  projectId: "greenroute-fyp",
  databaseURL: "https://greenroute-fyp-default-rtdb.firebaseio.com",
  storageBucket: "greenroute-fyp.firebasestorage.app",
  messagingSenderId: "955439154863",
  appId: "1:955439154863:web:aa4a25227670a5ac65b65a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
