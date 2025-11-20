import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

import Home from "./component/home";
import LoginPage from "./component/login";
import SignupPage from './component/signup';
import Dashboard from './component/dashboard';
import Leaderboard from './component/Leaderboard';
import AddTask from './component/Addtask';
import Badge from './component/badges.jsx';
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
  // Initialize tasks state
  const [tasks, setTasks] = useState([]);

  // Real-time task fetching from Firestore
  useEffect(() => {
    const fetchTasks = () => {
      try {
        const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tasksList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Global real-time tasks fetched:", tasksList.length, "tasks");
          setTasks(tasksList);
          
          // Also save to localStorage as backup
          localStorage.setItem("dashboardTasks", JSON.stringify(tasksList));
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up global real-time tasks listener:", error);
        // Fallback to localStorage
        const savedTasks = localStorage.getItem("dashboardTasks");
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks);
            setTasks(parsed);
          } catch (e) {
            console.warn('Failed to parse dashboardTasks from localStorage', e);
          }
        }
      }
    };

    const unsubscribe = fetchTasks();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

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
          path="/Point"
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
