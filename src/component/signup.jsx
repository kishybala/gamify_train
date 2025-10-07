import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📝 Email + Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // 2️⃣ Save Name + Email to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      });

      // 3️⃣ Save to localStorage for Dashboard name display
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.uid,
          name: form.name,
          email: form.email,
          role: "Student", // 👈 Agar aap role select karate ho to yahan usko set karo
        })
      );

      alert("Account created successfully!");
      navigate("/dashboard"); // ✅ Dashboard pe le jao
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  // 🌐 Google Sign-In
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user to Firestore if new
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      // ✅ Save to localStorage for Dashboard
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.uid,
          name: user.displayName || "",
          email: user.email,
          role: "Student",
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-300 to-yellow-200">
      <div className="w-[400px] bg-[#fff8e1] rounded-2xl shadow-xl p-6 border-4 border-yellow-400">
        <h1 className="text-3xl font-bold text-yellow-600 text-center mb-4">
          Sign Up
        </h1>

        {/* 📝 Signup Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-400"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>

        {/* 🌐 Google Signup */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-yellow-600 font-semibold hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
