import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

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

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get selected role from localStorage
  const selectedRole = localStorage.getItem("selectedRole");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✨ Email + Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

            // Get the selected role from localStorage, default to "Student"
      const selectedRole = localStorage.getItem("selectedRole") || "Student";
      const firstName = extractFirstName(user.displayName, user.email);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: firstName,
          email: user.email,
          role: selectedRole,
          points: 0,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.uid,
          name: firstName,
          email: user.email,
          role: selectedRole,
        })
      );

      // Redirect based on selected role
      if (selectedRole === "Mentor") {
        navigate("/mentor-dashboard");
      } else {
        navigate("/dashboard");
      }
      
      // Clear the selected role from localStorage
      localStorage.removeItem("selectedRole");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Google Sign-Up
  const handleGoogleSignup = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the selected role from localStorage, default to "Student"
      const selectedRole = localStorage.getItem("selectedRole") || "Student";
      
      // Extract first name from email or display name
      const firstName = extractFirstName(user.email, user.displayName);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: firstName,
          email: user.email,
          role: selectedRole,
          points: 0,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.uid,
          name: firstName,
          email: user.email,
          role: selectedRole,
        })
      );

      // Redirect based on selected role
      if (selectedRole === "Mentor") {
        navigate("/mentor-dashboard");
      } else {
        navigate("/dashboard");
      }
      
      // Clear the selected role from localStorage
      localStorage.removeItem("selectedRole");
    } catch (err) {
      console.error(err);
      setError(err.message);
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

      {/* ✨ Signup Box */}
      <div className="relative z-20 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Sign Up
        </h2>
        
        {/* Role Indicator */}
        {selectedRole && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg text-center">
            <p className="text-blue-200 text-sm">
              Selected Role: <span className="font-bold text-blue-100">{selectedRole}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="text-red-400 text-sm bg-red-900/50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-400 py-3 rounded-xl font-bold text-white transition hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <p className="text-gray-300 text-sm text-center mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-400 underline hover:text-pink-300">
              Login
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
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(50px, 80px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}