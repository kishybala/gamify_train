import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
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
    </div>
  );
}
