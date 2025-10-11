import React from "react";
import { useNavigate } from "react-router-dom";

// 🖼️ Assets

import featureImg from "../assets/ruchi.JPG";
import adminImg from "../assets/study.gif";
import logo from "../assets/logo.png";
import task1 from "../assets/task1.png";
import task2 from "../assets/task2.png";
import task3 from "../assets/task3.png";
import task4 from "../assets/task4.png";
import bgImage from "../assets/imagebg.png";


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-gray-900 min-h-screen flex flex-col">

      {/* 🌸 NAVBAR SECTION */}
      <nav className="flex justify-between items-center px-6 py-4 bg-[#A50355] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full  " />
          <h1 className="text-2xl font-bold tracking-wide text-white">
            Gamify Station
          </h1>
        </div>

        {/* Login Button */}
        <div>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[#A50355] hover:bg-pink-100 px-5 py-2 rounded-md font-semibold transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* 🌟 HERO SECTION */}


<section
  className="relative flex flex-col items-center justify-center text-center px-10 py-40 text-white bg-cover bg-center"
  style={{ backgroundImage: `url(${bgImage})` }}
>
  <div className="absolute inset-0 bg-black/50"></div> {/* Optional dark overlay */}

  <div className="relative z-10">
    <h2 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
      Welcome to <span className="text-pink-200">Gamify Station</span>
    </h2>
    <p className="text-lg md:text-xl max-w-2xl mb-8 text-pink-100">
      “Level up your learning journey with fun, challenges, and rewards 🏆”
    </p>
   
  
  </div>
</section>


      {/* 🧠 APPERICIATION  */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 bg-white">
        {/* Text Block */}
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h3 className="text-3xl font-bold mb-4 text-[#A50355]">
           🌟 Why Gamify Station Stands Out
          </h3>
         <p className="text-gray-700 leading-relaxed">
  Taking points and appreciation from teachers and parents keeps learners motivated and excited to improve. 
  Every achievement is recognized — whether it’s completing a task, helping a friend, or performing well. 
  Students can proudly showcase their progress, earn badges, and get real-time appreciation that boosts their confidence and learning spirit.
</p>
        </div>

        {/* Image Block */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={featureImg}
            alt="Features"
            className="rounded-xl shadow-lg w-full max-w-md object-cover"
          />
        </div>
      </section>

      {/* 🧑‍🏫 ADMIN SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 bg-[#A50355] text-white">
        {/* Image Block */}
        <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
          <img
            src={adminImg}
            alt="Admin Features"
            className="rounded-xl shadow-xl w-20px max-w-md object-cover bg-white/10 p-2"
          />
        </div>

        {/* Text Block */}
        <div className="md:w-1/2 md:text-left text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Amazing Features 💼
          </h3>
         <ul className="text-pink-100 leading-relaxed list-disc list-inside space-y-2">
  <li>Get exciting tasks to complete ✍️</li>
  <li>Raise hand to participate and engage 🙋</li>
  <li>Earn points for every achievement 🪙</li>
  <li>Check your rank on the leaderboard 🏆</li>
  <li>Play fun and interactive games 🎮</li>
  <li>Unlock badges as you level up 🥇</li>
</ul>
        
        </div>
      </section>

{/* 📝 CREATIVE TASKS SECTION — Xbox Style */}
<section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 bg-white">
  {/* Text Block */}
  <div className="md:w-1/2 md:text-left text-center mb-8 md:mb-0">
    <h3 className="text-3xl font-bold mb-4 text-[#A50355]">
  Mentor Dashboard 🧠
</h3>
<p className="text-gray-700 leading-relaxed mb-4">
  Empower mentors with powerful tools to manage and motivate students effectively. 
  From tracking progress to rewarding achievements — everything is at their fingertips:
</p>
<ul className="list-disc list-inside text-gray-700 space-y-2">
  <li>✅ Add new tasks and challenges for students</li>
  <li>🎯 Approve or reject submitted tasks</li>
  <li>🏆 Give or deduct points based on performance</li>
  <li>📊 Monitor individual student progress and achievements</li>
  <li>📅 Manage leaderboard and encourage healthy competition</li>
</ul>

  
  </div>

  {/* 🎮 Xbox-style Image Fan Stack */}
  <div className="md:w-1/2 flex justify-center perspective-[1200px]">
    <div className="relative flex items-center">
      {/* Front (main) image */}
      <img
        src={task1}
        alt="Task 1"
        className="w-40 md:w-60 rounded-lg shadow-2xl z-40 transform rotate-y-[-5deg] translate-x-0 scale-100 hover:scale-105 transition duration-300"
      />

      {/* 2nd image */}
      <img
        src={task4}
        alt="Task 4"
        className="absolute rounded-lg shadow-xl left-30 top-2 w-36 md:w-52 z-30 transform rotate-y-[-10deg] translate-x-14 scale-97 hover:scale-100 transition duration-300"
      />

      {/* 3rd image */}
      <img
        src={task3}
        alt="Task 3"
        className="absolute rounded-lg shadow-lg left-50 top-4 w-32 md:w-48 z-20 transform rotate-y-[-18deg] translate-x-20 scale-93 hover:scale-97 transition duration-300"
      />

     
    </div>
  </div>
</section>

      {/* 🌸 FOOTER */}
     <footer className="bg-[#A50355] py-10 text-white text-sm">
  <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* 📝 LEFT SIDE — Website Info */}
    <div>
      <h3 className="text-xl font-semibold mb-3 text-pink-200">Gamify Station</h3>
      <p className="text-pink-100 leading-relaxed">
        Gamify Station is a fun and interactive platform that turns learning into an exciting journey.
        Students can earn points, unlock badges, and track their progress while teachers and parents
        appreciate their achievements.
      </p>
    </div>

    {/* 👥 RIGHT SIDE — Team + Links */}
    <div className="flex flex-col md:items-end space-y-4">
      {/* Team Members */}
      <div>
        <h4 className="font-semibold text-lg mb-2 text-pink-200">✨ Team Members</h4>
        <ul className="text-pink-100 space-y-1 text-right">
          <li><a href="https://mine-portfolio-eosin.vercel.app/">Kishy Bala</a></li>
          <li><a href="https://portfolio-soni.netlify.app/">Soni Kumari</a></li>
          <li><a href="https://portfolio-snowy-chi-44.vercel.app/">Ruchi Kumari</a></li>
          <li><a href="#">SOP Program</a></li>
        </ul>
      </div>

     
    </div>

  </div>

  {/* 📅 BOTTOM COPYRIGHT */}
  
  <div className="border-t border-pink-300/30 mt-8 pt-4 text-center text-pink-100">
    © {new Date().getFullYear()} Gamify Station — All Rights Reserved.
       <p className="text-pink-100">
        Built with ❤️ by SOP Students
      </p>
  </div>
</footer>

    </div>
  );
}
