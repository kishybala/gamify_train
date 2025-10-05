import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login as", role, form);
    // Here you can add login API call
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-300 to-yellow-200 relative">
      {/* Card */}
      <div className="w-[400px] bg-[#fff8e1] rounded-2xl shadow-xl p-6 border-4 border-yellow-400 relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-yellow-600">Golden Farm</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-between mb-5">
          {["mentor", "student", "council"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 mx-1 py-2 rounded-lg capitalize font-semibold ${
                role === r ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm mb-2">or sign in with</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white p-2 rounded-full shadow border hover:bg-gray-100">
              <i className="fab fa-facebook-f text-blue-600"></i>
            </button>
            <button className="bg-white p-2 rounded-full shadow border hover:bg-gray-100">
              <i className="fab fa-google text-red-500"></i>
            </button>
          </div>
        </div>

        {/* Signup link */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-yellow-600 font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
