import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe1Mxiz4LucyAv_Xb5YIURDRt-M6Tpyro",
  authDomain: "purplesync-2a600.firebaseapp.com",
  projectId: "purplesync-2a600",
  storageBucket: "purplesync-2a600.firebasestorage.app",
  messagingSenderId: "240487576074",
  appId: "1:240487576074:web:904e33ee0535379aa425f3",
  measurementId: "G-Q9BLTRKE52"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
