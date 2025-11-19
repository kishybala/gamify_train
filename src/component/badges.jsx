import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const USER_NAME = "aasiya";
const INITIAL_POINTS = 23;

const LEVELS = [
  { id: 1, name: "Lemon Drop", icon: "🍋", points: 1 },
  { id: 2, name: "Candy Factory", icon: "🍬", points: 5 },
  { id: 3, name: "Chocolate Cave", icon: "🍫", points: 10 },
  { id: 4, name: "Rainbow Hill", icon: "🌈", points: 15 },
  { id: 5, name: "Sweet Lake", icon: "🧁", points: 25 },
  { id: 6, name: "Gummy Garden", icon: "🍭", points: 35 },
  { id: 7, name: "Final Treat", icon: "🏆", points: 50 },
];

export default function CandyPathOnTrack() {
  const navigate = useNavigate();
  const [points, setPoints] = React.useState(INITIAL_POINTS);

  const getUnlocked = (levelPoints) => points >= levelPoints;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-blue-100 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow hover:scale-105 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-pink-700 text-center flex-1">
          {USER_NAME}'s Candy Path 🍬
        </h1>
      </div>

      {/* Path SVG background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 1200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3ca6" />
              <stop offset="50%" stopColor="#ffb800" />
              <stop offset="100%" stopColor="#39c2ff" />
            </linearGradient>
          </defs>
          <path
            d="M200 1150 C 300 1000, 100 850, 250 700 S 100 450, 250 300 S 150 150, 200 50"
            stroke="url(#pathGradient)"
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Level nodes placed on the path */}
      <div className="absolute top-0 left-0 w-full h-full">
        {LEVELS.map((lvl, index) => {
          // Coordinates roughly match the path curve
          const positions = [
            { x: 200, y: 1100 },
            { x: 250, y: 900 },
            { x: 120, y: 700 },
            { x: 250, y: 520 },
            { x: 140, y: 350 },
            { x: 230, y: 200 },
            { x: 200, y: 80 },
          ];
          const pos = positions[index];
          const unlocked = getUnlocked(lvl.points);

          return (
            <motion.div
              key={lvl.id}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x - 35,
                top: pos.y - 35,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
            >
              <div
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl border-4 text-lg font-bold ${
                  unlocked
                    ? "bg-gradient-to-br from-green-300 to-lime-500 border-yellow-300 animate-bounce"
                    : "bg-white border-pink-400"
                }`}
              >
                <div className="text-2xl">{lvl.icon}</div>
                <div className="text-xs font-semibold">{lvl.id}</div>
              </div>

              <div className="text-center mt-2 text-xs text-gray-700 font-medium bg-white/80 px-2 py-1 rounded-lg shadow-sm">
                {lvl.name}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating candies for fun */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-10 left-10 text-4xl opacity-70"
      >
        🍭
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-10 right-10 text-5xl opacity-70"
      >
        🍬
      </motion.div>

      {/* Add points button (demo) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setPoints((p) => p + 5)}
          className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition"
        >
          +5 Points
        </button>
      </div>
    </div>
  );
}
