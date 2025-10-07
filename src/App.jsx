import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./component/login";
import SignupPage from './component/signup';
import Dashboard from './component/dashboard';
import Leaderboard from './component/Leaderboard';
import AddTask from './component/Addtask';
import Badge from './component/badges';
import PointsPage from './component/Point'; // <- import PointsPage

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

        {/* Pass all required props to Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              tasks={tasks}
              setTasks={setTasks}
              currentUser={currentUser}
            />
          }
        />

        {/* Leaderboard */}
        <Route
          path="/leaderboard"
          element={<Leaderboard currentUser={currentUser} />}
        />

        {/* Add Task - access controlled inside AddTask */}
        <Route
          path="/AddTask"
          element={
            <AddTask
              currentUser={currentUser}
              tasks={tasks}
              setTasks={setTasks}
            />
          }
        />

        {/* Badges */}
        <Route
          path="/Badges"
          element={<Badge currentUser={currentUser} />}
        />


        <Route
          path="/points"
          element={<PointsPage currentUser={currentUser} />}
        />
      </Routes>
    </Router>
      
  );
}
