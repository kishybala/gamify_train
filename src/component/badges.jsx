import React from 'react';
import { Award, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Configuration
const USER_NAME = 'aasiya';
const INITIAL_TASKS_COMPLETED = 23;

// Rarity Color Mapping
const RARITY_COLORS = {
  COMMON: 'bg-gray-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-600',
  LEGENDARY: 'bg-yellow-500',
};

// Badge Data
const ALL_BADGES = [
  { id: 'starter', name: 'First Step', icon: '🚀', rarity: 'COMMON', unlock_criteria_value: 1 },
  { id: 'first-ten', name: 'First Ten Tasks', icon: '👍', rarity: 'RARE', unlock_criteria_value: 10 },
  { id: 'quarter', name: 'Quarter Century', icon: '🌟', rarity: 'EPIC', unlock_criteria_value: 25 },
  { id: 'half-century', name: 'Half Century', icon: '👑', rarity: 'LEGENDARY', unlock_criteria_value: 50 },
  { id: 'community', name: 'Community Contributor', icon: '🗣️', rarity: 'RARE', unlock_criteria_value: 20 },
  { id: 'art', name: 'Art Virtuoso', icon: '🎨', rarity: 'EPIC', unlock_criteria_value: 30 },
  { id: 'social', name: 'Social Butterfly', icon: '🦋', rarity: 'COMMON', unlock_criteria_value: 5 },
  { id: 'master', name: 'Master Finisher', icon: '🏆', rarity: 'LEGENDARY', unlock_criteria_value: 100 },
];

// Calculate earned badges
const calculateEarnedBadges = (tasks) => {
  return ALL_BADGES.filter((badge) => tasks >= badge.unlock_criteria_value);
};

export default function BadgesPage() {
  const navigate = useNavigate();
  const [tasksCompleted] = React.useState(INITIAL_TASKS_COMPLETED);
  const earnedBadges = calculateEarnedBadges(tasksCompleted);

  // Get current user to determine which dashboard to return to
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const dashboardPath = currentUser.role === "Mentor" ? "/mentor-dashboard" : "/dashboard";

  const sortedBadges = [...ALL_BADGES].sort((a, b) => {
    const aEarned = earnedBadges.some((eb) => eb.id === a.id);
    const bEarned = earnedBadges.some((eb) => eb.id === b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return a.unlock_criteria_value - b.unlock_criteria_value;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-purple-100 font-sans p-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }`}
      </style>

      {/* Back Button */}
      <button
        onClick={() => navigate(dashboardPath)}
        className="mb-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-lg flex items-center justify-center">
          <Award size={36} className="text-green-500 mr-3" />
          {currentUser.name || USER_NAME}'s Badge Collection
          <Award size={36} className="text-green-500 ml-3" />
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          You have unlocked <span className="font-bold text-green-600">{earnedBadges.length}</span> out of {ALL_BADGES.length} badges!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedBadges.map((badge) => {
          const isEarned = earnedBadges.some((eb) => eb.id === badge.id);
          const progressPercentage = Math.min(100, (tasksCompleted / badge.unlock_criteria_value) * 100);
          const rarityColorClass = RARITY_COLORS[badge.rarity] || 'bg-gray-500';

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-105 shadow-xl ${
                isEarned ? 'bg-white border-green-500' : 'bg-gray-50 opacity-60 border-gray-300'
              }`}
            >
              <div className="relative h-16 flex flex-col items-center justify-center mb-3">
                {!isEarned && <Lock size={36} className="text-gray-400 absolute top-[-10px] z-10 bg-white rounded-full shadow-md" />}
                <div
                  className={`text-4xl p-3 rounded-full ${
                    isEarned ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {badge.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-2">{badge.name}</h3>

              <p
                className={`text-xs font-semibold uppercase mt-2 mb-3 inline-block py-1 px-3 rounded-full text-white ${
                  isEarned ? 'bg-green-600' : rarityColorClass
                }`}
              >
                {isEarned ? 'Unlocked' : badge.rarity}
              </p>

              <p className="text-sm text-gray-600 mb-3">Complete {badge.unlock_criteria_value} Tasks</p>

              <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isEarned ? 'bg-green-500' : 'bg-purple-400'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {isEarned ? '100%' : `${progressPercentage.toFixed(0)}%`} Complete
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
