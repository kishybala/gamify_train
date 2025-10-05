import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./component/login";
import SignupPage from './component/signup';
import Dashboard from './component/dashboard';
import Leaderboard from './component/Leaderboard';
import AddTask from './component/Addtask';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
         <Route path="/signup" element={<SignupPage />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/Leaderboard" element={<Leaderboard />} />
         <Route path="/AddTask" element={<AddTask />} />

      </Routes>
    </Router>
  );
}

export default App;
