// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyD13y-wv6ywsPNDRxkk6nBuZCRGfathWt0",
  authDomain: "univercity-5e3d1.firebaseapp.com",
  projectId: "univercity-5e3d1",
  storageBucket: "univercity-5e3d1.firebasestorage.app",
  messagingSenderId: "1092508343633",
  appId: "1:1092508343633:web:994a90224e6bcbdd8f0770",
  measurementId: "G-75TPY9BLBQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
