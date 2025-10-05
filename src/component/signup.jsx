import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", password: "", role: "student" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    console.log("Signup details", form);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-300 to-yellow-200">
      <div className="w-[400px] bg-[#fff8e1] rounded-2xl shadow-xl p-6 border-4 border-yellow-400">
        <h1 className="text-3xl font-bold text-yellow-600 text-center mb-4">Register</h1>
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
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
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="council">Council</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>

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
