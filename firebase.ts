import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// User info kisi ko nahi dikhegi, sirf usi user ko - iske liye Firebase Rules me ye add kar dena:
// Firestore Rules:
// match /users/{userId} {
//   allow read, write: if request.auth != null && request.auth.uid == userId;
// }
// match /userVotings/{docId} {
//   allow read: if resource.data.verificationStatus == 'verified' || resource.data.ownerId == request.auth.uid;
//   allow write: if request.auth != null;
// }
