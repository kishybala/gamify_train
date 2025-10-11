import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Get selected role from localStorage
  const selectedRole = localStorage.getItem("selectedRole");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      let userRole = "Student"; // default role
      let userName = "";
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userRole = userData.role || "Student";
        userName = userData.name || extractFirstName(user.displayName, user.email);
      } else {
        // If user document doesn't exist, extract name from email/displayName
        userName = extractFirstName(user.displayName, user.email);
      }
      
      // Store user data in localStorage
      localStorage.setItem("currentUser", JSON.stringify({
        id: user.uid,
        name: userName,
        email: user.email,
        role: userRole,
      }));
      
      // Redirect based on user role
      if (userRole === "Mentor") {
        navigate("/mentor-dashboard");
      } else {
        navigate("/dashboard");
      }
      
      // Clear the selected role from localStorage
      localStorage.removeItem("selectedRole");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* 🌈 Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-black">
        <div className="ambient-blob blob-1 bg-pink-400"></div>
        <div className="ambient-blob blob-2 bg-blue-500"></div>
        <div className="ambient-blob blob-3 bg-amber-300"></div>
      </div>

      {/* ✨ Login Box */}
      <div className="relative z-20 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        
        {/* Role Indicator */}
        {selectedRole && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg text-center">
            <p className="text-blue-200 text-sm">
              Selected Role: <span className="font-bold text-blue-100">{selectedRole}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-red-400 text-sm bg-red-900/50 p-2 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-400 py-3 rounded-xl font-bold text-white transition hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-300 text-sm text-center mt-3">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-pink-400 underline hover:text-pink-300">
              Sign up
            </Link>
          </p>
        </form>
      </div>

      {/* ✨ Ambient Blob Animation CSS */}
      <style jsx="true">{`
        .ambient-blob {
          position: absolute;
          width: 300px;
          height: 300px;
          filter: blur(100px);
          opacity: 0.6;
          border-radius: 50%;
          animation: moveBlob 20s infinite alternate ease-in-out;
        }
        .blob-1 {
          top: -100px;
          left: -100px;
        }
        .blob-2 {
          bottom: -120px;
          right: -150px;
          animation-duration: 25s;
        }
        .blob-3 {
          top: 50%;
          left: 60%;
          animation-duration: 30s;
        }
        @keyframes moveBlob {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(100px, -50px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
