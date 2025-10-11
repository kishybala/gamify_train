// ✅ src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";  // 👈 Make sure 'db' is exported from firebase.js

// Helper function to extract first name from email or display name
const extractFirstName = (email, displayName) => {
  if (displayName) {
    // If display name exists, return the first word
    return displayName.split(' ')[0];
  }
  if (email) {
    // Extract name from email (everything before @ and before any dots/numbers)
    const emailName = email.split('@')[0];
    // Remove numbers and dots, then capitalize first letter
    const cleanName = emailName.replace(/[0-9.]/g, '');
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  }
  return "User";
};

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to extract first name from email or display name
  const extractFirstName = (displayName, email) => {
    if (displayName && displayName.trim()) {
      return displayName.split(' ')[0]; // Get first word of display name
    }
    if (email) {
      const emailPart = email.split('@')[0];
      // Remove numbers and special characters, capitalize first letter
      const cleanName = emailPart.replace(/[0-9._-]/g, '');
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    return "User";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // 🧠 Step 0: Check if user doc exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Get the selected role from localStorage, default to "Student"
          const selectedRole = localStorage.getItem("selectedRole") || "Student";
          const firstName = extractFirstName(user.displayName, user.email);
          
          // ✨ Create default doc if user doesn't exist
          await setDoc(userRef, {
            email: user.email,
            name: firstName,
            role: selectedRole,
            totalPoints: 0,
            transactions: [],
            createdAt: new Date(),
          });
          console.log("✅ New user document created for:", user.email);
          
          // Store user data in localStorage
          localStorage.setItem("currentUser", JSON.stringify({
            id: user.uid,
            name: firstName,
            email: user.email,
            role: selectedRole,
          }));
        } else {
          const userData = userSnap.data();
          console.log("📄 User document exists for:", user.email);
          
          // Use stored name or extract from email/displayName as fallback
          const userName = userData.name || extractFirstName(user.displayName, user.email);
          
          // Store user data in localStorage
          localStorage.setItem("currentUser", JSON.stringify({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userData.role || "Student",
          }));
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
