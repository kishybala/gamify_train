import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./component/home";
import LoginPage from "./component/login";
import SignupPage from './component/signup';
import Dashboard from './component/dashboard';
import Leaderboard from './component/Leaderboard';
import AddTask from './component/Addtask';

import  Badge  from './component/badges';
import Pointer from "./component/point";



import MentorDashboard from './component/mentordash'; // 👈 Add this


// --- Mock Current User ---
const currentUser = {
  id: "current_user_123",
  name: "Soni24!",
  role: "Council", // Change to "Student" to block AddTask access
};

export default function App() {
  const [tasks, setTasks] = useState([]); // All tasks stored here


  return (
    <Router>
      <Routes>

        <Route path="/" element={<LoginPage />} />
         <Route path="/signup" element={<SignupPage />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/Leaderboard" element={<Leaderboard />} />
         <Route path="/AddTask" element={<AddTask />} />
         <Route path="/Badges" element={<Badge />} />
         <Route path="/Point" element={<Pointer />} />

        {/* 🏠 Home Page (Intro + Role Selection) */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />


        {/* 🧭 App Pages */}
        <Route
          path="/dashboard"
          element={<Dashboard tasks={tasks} setTasks={setTasks} currentUser={currentUser} />}
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard currentUser={currentUser} />}
        />


        <Route
  path="/mentor-dashboard"
  element={<MentorDashboard tasks={tasks} setTasks={setTasks} currentUser={currentUser} />}
/>

        <Route
  path="/addtask"
  element={
    (currentUser.role === "Council" || currentUser.role === "Mentor") ? 
    <AddTask currentUser={currentUser} tasks={tasks} setTasks={setTasks} /> 
    : <Dashboard tasks={tasks} setTasks={setTasks} currentUser={currentUser} />
  }
/>

        <Route
          path="/badges"
          element={<Badge currentUser={currentUser} />}
        />
      </Routes>
    </Router>
  );
}
