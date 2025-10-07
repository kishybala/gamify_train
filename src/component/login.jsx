import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 
import bg from "../assets/image.png";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.username,
        form.password
      );

      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === role) {
          // Save currentUser to localStorage
          localStorage.setItem("currentUser", JSON.stringify({
            id: user.uid,
            name: userData.name || "User",
            role: userData.role,
            profilePic: userData.profilePic || null
          }));

          alert(`Welcome ${userData.role}!`);
          navigate("/dashboard"); 
        } else {
          alert(`This account is not registered as ${role}`);
        }
      } else {
        alert("No user data found");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-[400px] bg-[#fff8e1] rounded-2xl shadow-xl p-6 border-4 border-yellow-400 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-yellow-600">Golden Farm</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

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

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            name="username"
            placeholder="Email"
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
