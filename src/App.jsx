import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./component/home";
import LoginPage from "./component/login";
import SignupPage from './component/signup';
import Dashboard from './component/dashboard';
import Leaderboard from './component/Leaderboard';
import AddTask from './component/Addtask';
import Badge from './component/badges';
import Pointer from "./component/point";
import MentorDashboard from './component/mentordash';
import UserProfile from './component/UserProfile';


// --- Mock Current User ---
const currentUser = {
  id: "current_user_123",
  name: "Soni24!",
  role: "Council", 
};

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardTasks');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const normalized = parsed.map(t => ({
        ...t,
        id: t.id || (`task_${(t.createdAt ? new Date(t.createdAt).getTime() : Date.now())}_${Math.random().toString(36).slice(2,8)}`)
      }));
      // Persist normalized back
      localStorage.setItem('dashboardTasks', JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      console.warn('Failed to load dashboardTasks from localStorage', e);
      return [];
    }
  }); // All tasks stored here

  return (
    <Router>
      <Routes>

        {/* 🏠 Home Page */}
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
            (currentUser.role === "Council" || currentUser.role === "Mentor") 
              ? <AddTask currentUser={currentUser} tasks={tasks} setTasks={setTasks} />
              : <Dashboard tasks={tasks} setTasks={setTasks} currentUser={currentUser} />
          }
        />
        <Route
          path="/badges"
          element={<Badge currentUser={currentUser} />}
        />
        <Route
          path="/point"
          element={<Pointer />}
        />
        <Route
          path="/user-profile"
          element={<UserProfile />}
        />
        
      </Routes>
    </Router>
  );
}
