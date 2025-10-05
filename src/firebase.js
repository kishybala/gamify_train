// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyArwJ46ilZz3PB4hknxPz7XGEw2zF5KUXI",
  authDomain: "gamify-station.firebaseapp.com",
  projectId: "gamify-station",
  storageBucket: "gamify-station.firebasestorage.app",
  messagingSenderId: "158401998275",
  appId: "1:158401998275:web:1f7d3cbbcae3ff726de176",
  measurementId: "G-6G1HQ8J64Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Add these exports 👇
export const auth = getAuth(app);
export const db = getFirestore(app);
