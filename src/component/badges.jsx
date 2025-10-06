import React from 'react';
// Using Lucide icons for a clean, modern look.
import { LogOut, Award, Layers, BarChart2, User, CheckCircle, Target, Users, Lock, Zap } from 'lucide-react'; 

// --- Configuration and Data ---
const ROLES = ['Student', 'Mentor', 'Counselor'];
const INITIAL_USER_ROLE = 'Mentor';
const USER_NAME = 'aasiya';
const TOTAL_BADGES_IN_COLLECTION = 8; // Changed from 10 to 8 to match the dummy data count
const INITIAL_TASKS_COMPLETED = 23;
const INITIAL_POINTS = 1250;

// Rarity Color Mapping for badges
const RARITY_COLORS = {
    'COMMON': 'bg-gray-500',
    'RARE': 'bg-blue-500',
    'EPIC': 'bg-purple-600',
    'LEGENDARY': 'bg-yellow-500',
};

// DUMMY BADGE DATA (Updated with Rarity)
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

// --- Utility Functions ---
const calculateEarnedBadges = (tasks) => {
    // Determine which badges have been earned based on tasks completed
    return ALL_BADGES.filter(badge => tasks >= badge.unlock_criteria_value);
};

// --- Sub-Components ---

/**
 * Component 1: Header Bar (Simplified for the dedicated Badges view)
 */
const HeaderBar = ({ points, earnedBadgesCount, userRole, userName, setUserRole }) => {
    return (
        <header className="flex items-center justify-between p-4 px-8 bg-white/70 backdrop-blur-sm shadow-xl rounded-b-3xl border-b-6 border-purple-500">
            <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-600 text-white shadow-xl">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        Welcome, <span className="capitalize ml-1 text-purple-600">{userName}!</span> 👋
                    </h1>
                    {/* Role Selector */}
                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="text-sm font-medium text-gray-600 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
                    >
                        {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex items-center space-x-6">
                {/* Points Badge */}
                <div className="flex items-center bg-yellow-100 border border-yellow-400 text-yellow-700 py-2 px-4 rounded-full font-bold shadow-md">
                    <Zap size={18} className="mr-2" />
                    {points} Points
                </div>
                {/* Badges Count (Static display since this is the Badges page) */}
                <div className="flex items-center bg-purple-100 border border-purple-400 text-purple-700 py-2 px-4 rounded-full font-bold shadow-md">
                    <Award size={18} className="mr-2" />
                    {earnedBadgesCount} Badges
                </div>
                {/* Logout Button */}
                <button className="flex items-center text-gray-700 hover:text-red-600 transition duration-200">
                    <LogOut size={20} className="mr-1" />
                    Logout
                </button>
            </div>
        </header>
    );
};

/**
 * Component 2: Progress Summary Card (Matches the design in the image)
 */
const ProgressSummary = ({ tasksCompleted, earnedBadgesCount }) => {
    const collectionCompletePercentage = Math.min(100, (earnedBadgesCount / TOTAL_BADGES_IN_COLLECTION) * 100).toFixed(0);
    return (
        <div className="bg-orange-100/70 p-6 rounded-2xl shadow-2xl border border-orange-300 my-8">
            <h3 className="text-xl font-bold text-gray-700 flex items-center mb-6">
                <CheckCircle size={24} className="mr-2 text-orange-600" /> Your Progress
            </h3>
            <div className="flex flex-wrap justify-around text-center space-y-4 md:space-y-0">
               
                <div className="w-1/3 min-w-[150px]">
                    <p className="text-5xl font-extrabold text-red-600 drop-shadow-md">{earnedBadgesCount}</p>
                    <p className="text-lg font-medium text-gray-600 mt-2">Badges Earned</p>
                </div>
               
                <div className="w-1/3 min-w-[150px]">
                    <p className="text-5xl font-extrabold text-red-600 drop-shadow-md">{tasksCompleted}</p>
                    <p className="text-lg font-medium text-gray-600 mt-2">Tasks Completed</p>
                </div>
               
                <div className="w-1/3 min-w-[150px]">
                    <p className="text-5xl font-extrabold text-red-600 drop-shadow-md">{collectionCompletePercentage}%</p>
                    <p className="text-lg font-medium text-gray-600 mt-2">Collection Complete</p>
                </div>
            </div>
        </div>
    );
};

/**
 * Component 3: Badge Summary View (The main content, matches the image grid)
 */
const BadgeSummaryView = ({ tasksCompleted, earnedBadges }) => {
    // Sort badges: Earned first, then by required task value
    const sortedBadges = [...ALL_BADGES].sort((a, b) => {
        const aEarned = earnedBadges.some(eb => eb.id === a.id);
        const bEarned = earnedBadges.some(eb => eb.id === b.id);
       
        if (aEarned && !bEarned) return -1;
        if (!aEarned && bEarned) return 1;
        return a.unlock_criteria_value - b.unlock_criteria_value;
    });

    return (
        <div className="mt-8">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow-lg flex items-center justify-center">
                    <Award size={36} className="text-yellow-500 mr-3" fill="#facc15" />
                    Badge Collection
                    <Award size={36} className="text-yellow-500 ml-3" fill="#facc15" />
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                    Unlock amazing badges by completing tasks and reaching milestones!
                </p>
            </div>
           
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedBadges.map(badge => {
                    const isEarned = earnedBadges.some(eb => eb.id === badge.id);
                    const currentProgress = tasksCompleted;
                    const required = badge.unlock_criteria_value;
                    const progressPercentage = Math.min(100, (currentProgress / required) * 100);
                   
                    // Styling for the card container
                    const cardClasses = isEarned
                        ? 'bg-white/95 border-green-500 shadow-2xl scale-[1.02] transform hover:shadow-green-300/50'
                        : 'bg-gray-50/90 border-gray-300 opacity-60'; // Grey out locked badges
                   
                    const rarityColorClass = RARITY_COLORS[badge.rarity] || 'bg-gray-500';
                    const progressColorClass = isEarned ? 'bg-green-500' : 'bg-purple-400';

                    return (
                        <div key={badge.id} className={`p-5 rounded-2xl border-2 ${cardClasses} text-center transition-all duration-300`}>
                           
                            {/* Icon / Lock */}
                            <div className="relative h-16 w-full flex flex-col items-center justify-center mb-3">
                                {!isEarned && (
                                    // Padlock for locked badges
                                    <Lock size={30} className="text-gray-400 absolute top-[-5px] z-10 p-1 bg-white rounded-full shadow-lg border border-gray-200" />
                                )}
                                <div className={`text-4xl mx-auto p-3 rounded-full w-fit mt-4 ${isEarned ? 'bg-green-100 text-green-600 shadow-md' : 'bg-gray-200/50 text-gray-500'}`}>
                                    {badge.icon}
                                </div>
                            </div>
                           
                            <h3 className="text-lg font-bold text-gray-800 truncate mt-1">{badge.name}</h3>
                           
                            {/* Rarity Tag / Status */}
                            <p className={`text-xs font-semibold uppercase mt-2 mb-3 inline-block py-1 px-3 rounded-full text-white ${isEarned ? 'bg-green-600 shadow-sm' : rarityColorClass}`}>
                                {isEarned ? 'UNLOCKED' : badge.rarity}
                            </p>
                           
                            {/* Description / Status */}
                            <p className="text-sm text-gray-600 mb-4 font-medium">
                                Complete {required} Tasks
                            </p>
                           
                            {/* Progress Bar */}
                            <div className="mb-1">
                                <div className="h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-500 ${progressColorClass}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                    {isEarned ? '100% Complete' : `${progressPercentage.toFixed(0)}% Complete`}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  // State initialization using the provided mock data
  const [tasksCompleted] = React.useState(INITIAL_TASKS_COMPLETED);
  const [points] = React.useState(INITIAL_POINTS);
  const [userRole, setUserRole] = React.useState(INITIAL_USER_ROLE);
 
  // Calculate earned badges based on current tasks completed
  const earnedBadges = React.useMemo(() => calculateEarnedBadges(tasksCompleted), [tasksCompleted]);
  const earnedBadgesCount = earnedBadges.length;
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-100 font-sans">
       
        {/* Load Inter font and apply subtle body styling */}
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
            body { font-family: 'Inter', sans-serif; }
            `}
        </style>
        
        <div className="max-w-7xl mx-auto pb-12">
           
            {/* 1. Header (User Info Bar) */}
            <HeaderBar
                points={points}
                earnedBadgesCount={earnedBadgesCount}
                userRole={userRole}
                userName={USER_NAME}
                setUserRole={setUserRole}
            />
           
            {/* 2. Main Content Container */}
            <main className="p-4 sm:p-6 lg:p-8">
                
                {/* Progress Summary Card (Top Section) */}
                <ProgressSummary
                    tasksCompleted={tasksCompleted}
                    earnedBadgesCount={earnedBadgesCount}
                />
                
                {/* Detailed Badge Gallery */}
                <BadgeSummaryView 
                    tasksCompleted={tasksCompleted} 
                    earnedBadges={earnedBadges} 
                />
                
            </main>
        </div>
    </div>
  );
}
