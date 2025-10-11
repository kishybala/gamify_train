import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentVideo from "../assets/student.mp4";
import mentorVideo from "../assets/mentor.mp4";
import bgImage from "../assets/gamify.jpg";

const PROJECT_NAME = "GAMIFY STATION";
const LETTER_REVEAL_DELAY_MS = 100;
const INTRO_DURATION_MS = 2500;

export default function Home() {
  const [textIndex, setTextIndex] = useState(0);
  const [stage, setStage] = useState("intro");
  const navigate = useNavigate();
  const textToDisplay = PROJECT_NAME.split("");

  useEffect(() => {
    if (stage !== "intro") return;

    if (textIndex < textToDisplay.length) {
      const timer = setTimeout(
        () => setTextIndex((prev) => prev + 1),
        LETTER_REVEAL_DELAY_MS
      );
      return () => clearTimeout(timer);
    }

    if (textIndex === textToDisplay.length) {
      const transitionTimer = setTimeout(
        () => setStage("roles"),
        INTRO_DURATION_MS
      );
      return () => clearTimeout(transitionTimer);
    }
  }, [stage, textIndex]);

  const roles = [
    { name: "Student", video: studentVideo, color: "from-green-700 to-green-500" },
    { name: "Mentor", video: mentorVideo, color: "from-purple-800 to-purple-500" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-white">
      {/* 🖼 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "brightness(0.6)",
        }}
      ></div>

      {/* ✨ Overlay Blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      {/* 🫧 Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={`bubble bubble-${i + 1}`}></div>
        ))}
      </div>

      {/* 💫 Main Content */}
      <div className="relative z-20 text-center w-full p-4">
        {stage === "intro" ? (
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest flex justify-center flex-wrap gap-1">
            {textToDisplay.map((char, index) => (
              <span
                key={index}
                className="neon-letter"
                style={{
                  animation:
                    index < textIndex
                      ? `letterPop 0.5s ease-out forwards ${index * LETTER_REVEAL_DELAY_MS}ms, flicker 2s infinite ${index * 100}ms`
                      : "none",
                  opacity: index < textIndex ? 1 : 0,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        ) : (
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-4">
            {/* 📝 Left Section - About */}
            <div className="md:w-1/2 text-left">
              <h2 className="game-heading mb-4">
                Welcome to Gamify Station
              </h2>
              <p className="text-lg leading-relaxed text-gray-200">
                Level up your learning journey! At Gamify Station, students and mentors
                collaborate in a dynamic, game-inspired environment. Choose your role and
                start your adventure today.
              </p>
            </div>

            {/* 🟩🟪 Right Section - Roles */}
            <div className="md:w-1/2 flex flex-col md:flex-row justify-center items-center gap-8">
              {roles.map((role) => (
                <div
                  key={role.name}
                  onClick={() => {
                    // Store the selected role in localStorage
                    localStorage.setItem("selectedRole", role.name);
                    navigate("/login");
                  }}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${role.color} bg-opacity-40 cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] role-card w-64`}
                >
                  <video
                    src={role.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-44 h-44 mx-auto mb-4 object-contain rounded-lg group-hover:grayscale-0 grayscale transition-all duration-500"
                  />
                  <h3 className="text-2xl font-bold group-hover:glitch">{role.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✨ CSS */}
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        .game-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: white;
        }

        .bubble {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: floatBubble linear infinite;
        }

        @keyframes floatBubble {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          10% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }

        ${Array.from({ length: 25 })
          .map(
            (_, i) => `
          .bubble-${i + 1} {
            left: ${Math.random() * 100}%;
            width: ${8 + Math.random() * 20}px;
            height: ${8 + Math.random() * 20}px;
            background: radial-gradient(circle, rgba(${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, 0.8), transparent);
            animation-duration: ${15 + Math.random() * 20}s;
            animation-delay: ${Math.random() * 20}s;
          }
        `
          )
          .join("")}

        @keyframes letterPop {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; filter: blur(4px); }
          60% { transform: translateY(-5px) scale(1.2); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0; }
        }

        .neon-letter {
          color: #fff;
          text-shadow: 0 0 5px #fff, 0 0 15px #ff005b, 0 0 30px #ff005b;
        }

        .flicker-text {
          animation: flicker 3s infinite;
          text-shadow: 0 0 5px #fff, 0 0 15px #ff0000, 0 0 30px #ff0000;
        }

        .group-hover\\:glitch:hover {
          position: relative;
          color: #fff;
          text-shadow: 2px 2px #ff005b, -2px -2px #00ffff;
          animation: glitchAnim 0.3s infinite;
        }

        @keyframes glitchAnim {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        .role-card:hover {
          box-shadow: 0 0 25px rgba(255, 0, 90, 0.5), 0 0 50px rgba(255, 0, 90, 0.3);
        }
      `}</style>
    </div>
  );
}
