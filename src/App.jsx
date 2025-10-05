import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./component/login";
import SignupPage from './component/signup';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
         <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
