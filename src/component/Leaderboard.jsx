import React, { useState, useMemo, useEffect } from "react"; 

// --- Firebase and Navigation Mocking for Single-File Environment ---
// Mocking the environment constants for a single-file context
const mockAuth = {
    currentUser: { uid: 'mockUserId123' }
};
const getAuth = () => mockAuth;

const signOut = () => {
    return new Promise(resolve => {
        console.log("Firebase Mock: Successfully signed out.");
        resolve();
    });
};

const useNavigate = () => (path) => {
    const targetPath = path || '/';
    console.log(`Simulating navigation to: ${targetPath}`);
};


// --- Data Definitions ---
const AVATAR_BASE_URL = "https://api.dicebear.com/8.x/fun-emoji/svg?seed=";

const COMMON_DATA_ENTRIES = [
    // Current User
    { name: "Ruchi Sharma", role: "Student", department: "Academic", badges: ["star", "gold"], streak: 5 }, 
    
    // Top Performers (Varied for dynamic testing)
    { name: "Sunil Verma", role: "Mentor", department: "Academic", badges: ["gold", "warrior"], streak: 15 },
    { name: "Kameron Porter", role: "Council", department: "Academic", badges: ["gold", "silver"], streak: 12 },
    { name: "Alice Koller", role: "Mentor", department: "Academic", badges: ["star", "bronze"], streak: 10 },
    
    // More Students
    { name: "Michael Kopfler", role: "Student", department: "Sports", badges: ["silver"], streak: 8 },
    { name: "Elara Vance", role: "Student", department: "Academic", badges: ["warrior"], streak: 8 },
    { name: "George Limbot", role: "Student", department: "Academic", badges: ["bronze"], streak: 6 },
    { name: "Peter Dinklage", role: "Student", department: "Cultural", badges: ["bronze"], streak: 5 },
    { name: "Marcus Chen", role: "Student", department: "Sports", badges: ["warrior"], streak: 4 },
    { name: "Zara Sheikh", role: "Council", department: "Cultural", badges: ["silver"], streak: 9 },
    
    // Additional Entries
    { name: "Aarav Gupta", role: "Student", department: "Academic", badges: ["bronze"], streak: 4 },
    { name: "Priya Singh", role: "Student", department: "Cultural", badges: ["silver"], streak: 7 },
    { name: "David Kim", role: "Student", department: "Sports", badges: [], streak: 2 },
    { name: "Sana Khan", role: "Mentor", department: "Academic", badges: ["star"], streak: 11 },
    { name: "Javier Lopez", role: "Student", department: "Academic", badges: ["bronze"], streak: 3 },
    { name: "Lina Wong", role: "Student", department: "Sports", badges: ["warrior"], streak: 6 },
    { name: "Vikram Reddy", role: "Council", department: "Academic", badges: ["gold"], streak: 14 },
    { name: "Nisha Patel", role: "Mentor", department: "Cultural", badges: ["star"], streak: 9 },
    { name: "Ryan Kelly", role: "Student", department: "Sports", badges: ["silver"], streak: 7 },
    { name: "Juana Perez", role: "Student", department: "Academic", badges: [], streak: 1 },
];

const COMMON_DATA = COMMON_DATA_ENTRIES.map(u => ({
    ...u,
    avatar: `${AVATAR_BASE_URL}${encodeURIComponent(u.name)}&r=50`
}));

// Adjusted point logic to ensure ranks shift when filters change for better animation testing
const TODAY_DATA = COMMON_DATA.map((u, i) => ({
    ...u,
    points: 800 - i * 30 - (u.department === "Academic" ? 0 : 50), 
    completed: Math.max(10, 50 - i * 2) 
}));

const WEEKLY_DATA = COMMON_DATA.map((u, i) => ({
    ...u,
    points: 8000 - i * 300 - (u.department === "Sports" ? 0 : 500), 
    completed: 100 - i * 4 
}));

const MONTHLY_DATA = COMMON_DATA.map((u, i) => ({
    ...u,
    points: 15000 - i * 500 - (u.department === "Cultural" ? 0 : 800), 
    completed: 100 - i * 2.5
}));

const CURRENT_USER_NAME = "Ruchi Sharma";

// Custom Tailwind Utility Classes
const avatarClass = "w-10 h-10 rounded-full object-cover shadow-lg bg-gray-700 p-0.5";
const largeAvatarClass = "w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-gray-600 bg-gray-800 p-1";
const inputSelectClass = "p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-150 ease-in-out";


// --- Background Bubble Component ---
const Bubbles = () => {
    // Generate an array of 20 bubbles with random properties
    const bubbles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: 10 + Math.random() * 60, // Size between 10px and 70px
        left: Math.random() * 100, // Starting position from 0% to 100% horizontally
        animationDuration: 8 + Math.random() * 15, // Duration between 8s and 23s
        delay: Math.random() * -10, // Animation delay (negative to start animation immediately)
        opacity: 0.1 + Math.random() * 0.2, // Opacity between 0.1 and 0.3
        color: Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(168, 85, 247, 0.5)' // Blue or Purple
    })), []);

    return (
        <>
            <style>
                {`
                @keyframes bubble-up {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 0.1;
                    }
                    50% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(-100vh) scale(1.2); /* Move fully out of view */
                        opacity: 0;
                    }
                }
                .bubble {
                    position: absolute;
                    bottom: -100px; /* Start below the viewport */
                    border-radius: 50%;
                    pointer-events: none;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
                    animation: bubble-up infinite linear;
                }
                `}
            </style>
            <div className="absolute inset-0 z-0 overflow-hidden">
                {bubbles.map(bubble => (
                    <div
                        key={bubble.id}
                        className="bubble"
                        style={{
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            left: `${bubble.left}vw`,
                            background: bubble.color,
                            opacity: bubble.opacity,
                            animationDuration: `${bubble.animationDuration}s`,
                            animationDelay: `${bubble.delay}s`,
                        }}
                    ></div>
                ))}
            </div>
        </>
    );
};


// --- Rules Modal Component (Dark Theme) ---
const RulesModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl relative z-10 transform transition-transform duration-300 border border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-400 border-b border-gray-700 pb-3 mb-4 flex items-center">
                Leaderboard Rules 
                <span className="ml-2 text-3xl">📜</span>
            </h3>
            <div className="max-h-80 overflow-y-auto text-gray-300 space-y-3">
                <p><strong>1. Scoring:</strong> Points (XP) are earned based on contributions (e.g., project completion, code reviews, mentorship hours).</p>
                <p><strong>2. Cycles:</strong> Leaderboards reset daily, weekly, and monthly.</p>
                <p><strong>3. Fair Play:</strong> Any attempt to manipulate scores will result in account suspension.</p>
                <p><strong>4. Badges:</strong> Badges are permanent achievements reflecting historical excellence.</p>
                <p className="pt-2 text-sm text-gray-500 italic">Filters dynamically affect rankings, showcasing the 'climb' on the ladder.</p>
            </div>
            <button 
                onClick={onClose} 
                className="mt-6 w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/30"
            >
                Understood
            </button>
        </div>
    </div>
);

// --- Profile Sidebar Component (Dark Theme) ---
const ProfileSidebar = ({ user, onClose, onLogout }) => { 
    if (!user) return null;
    const BADGE_ICONS = { gold: "👑", silver: "✨", bronze: "🥉", star: "⭐", warrior: "🌿" };
    const mockActivity = [
        { id: 1, type: "Project", title: "Finished project planning", points: 200, time: "2 hours ago" },
        { id: 2, type: "Review", title: "Reviewed code for A. Gupta", points: 150, time: "Yesterday" },
    ];

    return (
        <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900 shadow-2xl p-6 transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-700"> 
                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6 sticky top-0 bg-gray-900 z-10">
                    <h3 className="text-2xl font-bold text-white">My Profile</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    <img src={user.avatar} alt={user.name} className={largeAvatarClass + " mb-4"} />
                    <h4 className="text-xl font-bold text-white">{user.name}</h4>
                    <p className="text-sm text-gray-400 mb-4">{user.role} - {user.department}</p>
                    <div className="w-full grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-800 p-3 rounded-xl text-center shadow-inner border border-blue-800/50">
                            <p className="text-2xl font-extrabold text-blue-400">{user.points}</p>
                            <p className="text-xs text-gray-400">Total XP</p>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-xl text-center shadow-inner border border-green-800/50">
                            <p className="text-2xl font-extrabold text-green-400">🔥 {user.streak}</p>
                            <p className="text-xs text-gray-400">Streak Days</p>
                        </div>
                    </div>
                    <div className="w-full border-t border-gray-700 pt-4">
                        <p className="font-semibold text-gray-300 mb-2">My Badges ({user.badges.length})</p>
                        <div className="flex flex-wrap gap-2 text-2xl justify-center mb-6">
                            {user.badges.length > 0 ? (
                                user.badges.map(b => <span key={b} title={b.charAt(0).toUpperCase() + b.slice(1)} className="p-2 bg-gray-700 rounded-lg shadow-sm">{BADGE_ICONS[b]}</span>)
                            ) : (
                                <p className="text-sm text-gray-500">No badges earned yet.</p>
                            )}
                        </div>
                    </div>
                    <div className="w-full border-t border-gray-700 pt-4">
                        <p className="font-semibold text-gray-300 mb-3">Recent Activity</p>
                        <div className="space-y-3">
                            {mockActivity.map(activity => (
                                <div key={activity.id} className="p-3 bg-gray-800 rounded-lg flex justify-between items-center border border-gray-700">
                                    <div>
                                        <p className="font-medium text-gray-200 text-sm">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.type} • {activity.time}</p>
                                    </div>
                                    <span className="text-sm font-bold text-green-400">+{activity.points} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="mt-6 w-full py-2 flex items-center justify-center bg-gray-700 text-gray-200 font-semibold rounded-xl hover:bg-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Account Settings
                    </button>
                </div>
                <button 
                    className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition duration-300"
                    onClick={onLogout} 
                >
                    Log Out
                </button>
                <div className="h-4"></div>
            </div>
        </div>
    );
};


// --- Helper Component for the Podium (Dramatic Slide-In and Neon Look) ---
const PodiumItem = ({ user, rank, currentUserName, animate, delayIndex }) => {
    
    // 1. Define styles based on rank (Neon/Gaming theme)
    const getPodiumStyles = (rank) => {
        let heightClass, topGradient, borderShadow, avatarRingColor, medalIcon, medalColor, neonGlow;

        if (rank === 1) {
            heightClass = "h-[250px] sm:h-[300px]"; 
            topGradient = "bg-gradient-to-t from-yellow-500 to-amber-300";
            borderShadow = "shadow-[0_0_50px_rgba(255,215,0,0.8)]"; // Golden Neon Shadow
            avatarRingColor = 'ring-yellow-400 ring-4';
            medalIcon = "🏆";
            medalColor = "text-yellow-400";
            neonGlow = "shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-pulse-slow"; // Subtle Pulse
        } else if (rank === 2) {
            heightClass = "h-[180px] sm:h-[220px]"; 
            topGradient = "bg-gradient-to-t from-gray-400 to-gray-200";
            borderShadow = "shadow-[0_0_40px_rgba(150,150,200,0.5)]"; // Silver Neon Shadow
            avatarRingColor = 'ring-gray-300 ring-3';
            medalIcon = "🥈";
            medalColor = "text-gray-300";
            neonGlow = "";
        } else { // rank 3
            heightClass = "h-[120px] sm:h-[150px]";
            topGradient = "bg-gradient-to-t from-orange-400 to-amber-200";
            borderShadow = "shadow-[0_0_30px_rgba(255,165,0,0.5)]"; // Bronze Neon Shadow
            avatarRingColor = 'ring-orange-300 ring-3';
            medalIcon = "🥉";
            medalColor = "text-amber-500";
            neonGlow = "";
        }
        
        // Podium block class with enhanced styling
        const podiumClass = `${heightClass} ${topGradient} ${borderShadow} transition-all duration-500 ease-in-out rounded-t-xl overflow-hidden`;

        return { podiumClass, avatarRingColor, medalIcon, medalColor, neonGlow };
    };

    const { podiumClass, avatarRingColor, medalIcon, medalColor, neonGlow } = getPodiumStyles(rank);
    
    const isCurrentUser = user && user.name === currentUserName;
    
    const podiumAvatarClass = "w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-2xl ring-2 transition duration-500 transform-gpu absolute -top-8 sm:-top-10 z-20 bg-gray-900";
    
    // Fallback for an empty rank
    if (!user) {
        return (
            <div className={`flex flex-col items-center justify-end w-1/3 p-1 sm:p-2 transition-all duration-1000`}>
                <div className={`w-full h-[100px] sm:h-[130px] flex items-center justify-center text-4xl sm:text-6xl font-black text-gray-500 bg-gray-800 rounded-t-xl`}>
                    {rank}
                </div>
            </div>
        );
    }

    // --- Animation Logic for Dramatic Slide-In ---
    const initialTransform = 'translate-x-[100vw]'; 
    const finalTransform = 'translate-x-0';
    const animationStyle = {
        // Custom cubic-bezier for a spring/bounce effect on arrival
        transition: 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.7s ease-out', 
        transitionDelay: `${(delayIndex) * 0.15}s`, // Staggered delay 
        transform: animate ? finalTransform : initialTransform,
        opacity: animate ? 1 : 0, 
    };
    
    const finalAvatarRingClass = isCurrentUser ? 'ring-blue-400 ring-4' : avatarRingColor;


    return (
        <div 
            className={`flex flex-col items-center justify-end w-1/3 p-1 sm:p-2 relative transition-all duration-1000`}
            style={animationStyle} 
        >
            {/* User Info Above Podium Block */}
            <div className="absolute top-0 flex flex-col items-center justify-center w-full">
                
                {/* --- Rank 1 Exaggerated Golden Glow --- */}
                {rank === 1 && (
                    <div className="absolute w-32 h-32 rounded-full bg-yellow-400/80 blur-xl opacity-80 z-15" 
                        style={{ 
                            top: '-30px', 
                            animation: 'pulse 1.5s infinite alternate' 
                        }}>
                    </div>
                )}
                
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className={podiumAvatarClass + ' ' + finalAvatarRingClass} 
                    style={{ 
                        transform: rank === 1 ? 'scale(1.1) translateY(-10px)' : 'scale(1.0)',
                    }}
                />
                
                <div className={`mt-[4.5rem] sm:mt-[5.5rem] text-center w-full z-10 ${neonGlow} rounded-lg`}>
                    <p className="font-bold text-sm sm:text-lg text-white truncate max-w-[90%] mx-auto">{user.name.split(' ')[0]}</p> 
                    <p className={`text-xs font-bold text-black bg-yellow-400 px-3 py-1 mt-1 rounded-full shadow-lg transition duration-300 hover:scale-105`} >
                        {user.points} XP
                    </p>
                </div>
            </div>

            {/* Podium Block - The main 3D visual element */}
            <div className={`w-full ${podiumClass} flex items-center justify-center font-black text-white/90 relative mt-4 border-2 border-white/10`}>
                {/* Darker bottom layer for 3D depth */}
                <div className={`absolute bottom-0 left-0 right-0 h-4 bg-gray-900 shadow-inner`}></div>
                
                {/* Rank Number and Medal */}
                <span className={`text-5xl sm:text-7xl absolute top-4 ${medalColor} font-extrabold flex items-center`}>
                    <span className="text-3xl sm:text-4xl mr-2">{medalIcon}</span>
                    {rank}
                </span>
            </div>
        </div>
    );
};


// --- Main Leaderboard Component ---
const LeaderboardPanel = () => {
    
  const [activeTab, setActiveTab] = useState("Today");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 
  const [showRulesModal, setShowRulesModal] = useState(false); 
  
  const [animatePodium, setAnimatePodium] = useState(false); 

  const searchInputRef = React.useRef(null); 
  const navigate = useNavigate();

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    try {
        const authInstance = getAuth();
        await signOut(authInstance);
        setShowProfile(false);
        navigate('/');
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
  };
  
  const dataSource = useMemo(() => {
    if (activeTab === "Weekly") return WEEKLY_DATA;
    if (activeTab === "Monthly") return MONTHLY_DATA;
    return TODAY_DATA;
  }, [activeTab]);

  const allDepartments = useMemo(() => Array.from(new Set(COMMON_DATA.map(u => u.department))), []);

  const availableRoles = useMemo(() => {
    let data = [...dataSource];
    if (departmentFilter !== "All") data = data.filter((user) => user.department === departmentFilter);
    return Array.from(new Set(data.map((user) => user.role)));
  }, [departmentFilter, dataSource]);

  const filteredData = useMemo(() => {
    let data = [...dataSource];
    if (departmentFilter !== "All") data = data.filter((user) => user.department === departmentFilter);
    if (roleFilter !== "All") data = data.filter((user) => user.role === roleFilter);
    if (searchQuery) data = data.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Sort by points and then assign rank
    data.sort((a,b)=>b.points-a.points);
    return data.map((user,index)=>({...user, rank:index+1}));
  }, [departmentFilter, roleFilter, searchQuery, dataSource]);
  
  // --- Podium Animation Trigger Effect ---
  useEffect(() => {
    setAnimatePodium(false);
    const timeoutId = setTimeout(() => {
        setAnimatePodium(true);
    }, 50); 
    return () => clearTimeout(timeoutId);
  }, [activeTab, departmentFilter, roleFilter, searchQuery]); 

  const top3 = filteredData.slice(0, 3);
  const rank1 = top3[0] || null;
  const rank2 = top3[1] || null;
  const rank3 = top3[2] || null;
  const list = filteredData.slice(3); 
  
  const currentUser = filteredData.find((u) => u.name===CURRENT_USER_NAME);
  
  // --- Effect to lock body scroll when sidebar/modal is open ---
  useEffect(() => {
    if (showProfile || showRulesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProfile, showRulesModal]);

  const handleSearchClick = () => {
      setShowFilters(prev => !prev); 
      if (!showFilters && searchInputRef.current) {
          setTimeout(() => searchInputRef.current.focus(), 100);
      }
  };
    
  const handleRulesClick = () => {
      setShowRulesModal(true);
  };

  const handleDepartmentsClick = () => {
      setDepartmentFilter("All");
      setRoleFilter("All");
      setSearchQuery("");
      console.log("Filters reset.");
  };

  // --- Helper Component for the list item (Enhanced Hover Effect) ---
  const LeaderboardItem = ({ user }) => {
    return (
        <div 
            className={`flex items-center p-3 rounded-xl transition duration-300 text-sm cursor-pointer border border-gray-700
                ${user.name === CURRENT_USER_NAME 
                    ? "bg-blue-900/50 border-l-8 border-blue-400 font-semibold ring-1 ring-blue-500 shadow-xl shadow-blue-900/50" 
                    : "bg-gray-800 hover:bg-gray-700/80 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-900/50 hover:ring-2 hover:ring-blue-500/50 transform translate-x-0"
                }
            `}
        >
            <div className="flex items-center flex-1 min-w-0">
                <span className={`w-8 text-center font-extrabold text-lg mr-3 ${user.name === CURRENT_USER_NAME ? 'text-blue-400' : 'text-gray-400'}`}>
                    #{user.rank}
                </span>
                <img src={user.avatar} alt={user.name} className={avatarClass + " mr-3 ring-1 ring-gray-600"}/>
                <div className="text-left truncate">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className={`text-xs text-gray-400 font-medium`}>
                        {user.role} | XP: <span className="text-purple-400 font-bold">{user.points}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-xs hidden md:block text-right">
                    <p className="font-bold text-gray-300">{user.completed}% Completed</p>
                    <div className="h-2 w-20 bg-gray-700 rounded-full mt-1">
                        <div className="bg-gradient-to-r from-green-400 to-teal-400 h-2 rounded-full" style={{ width: `${user.completed}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const visibleList = list.slice(0, 10);
  const hasMoreUsers = list.length > 10;
  const isCurrentUserOutsideVisibleList = currentUser && currentUser.rank > 13;
  const hasResults = rank1 || rank2 || rank3 || list.length > 0;

  return (
    // Apply dark, futuristic background styling
    <div className="min-h-screen flex flex-col items-center p-0 md:p-8 font-sans relative" style={{
        backgroundColor: '#0a0a1a', // Deep space background
        backgroundImage: 'radial-gradient(circle at 50% 10%, #1a1a4a 0%, #0a0a1a 80%)',
        color: '#E5E7EB', // Light gray text
    }}>
        
        {/* --- 1. Background Bubble Component --- */}
        <Bubbles />
        
        <style>
            {`
            @keyframes pulse {
                0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.4); }
                100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); }
            }
            .animate-pulse-slow {
                animation: pulse 1.5s infinite alternate;
            }
            `}
        </style>
        
        {/* --- Dashboard Header (Dark Bar - Sticky Navbar) --- */}
        <header className="w-full bg-black/90 text-white p-4 shadow-2xl sticky top-0 z-30 border-b border-blue-900/50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="text-3xl font-extrabold tracking-wider text-yellow-400/90 [text-shadow:_0_0_5px_rgba(255,215,0,0.5)]">GAME CHANGER 🚀</div>
                
                <div className="flex space-x-4 items-center">
                    <button 
                        onClick={handleSearchClick} 
                        title={showFilters ? "Hide Filters" : "Show Filters"} 
                        className={`p-2 transition duration-200 hover:scale-110 rounded-full ${showFilters ? 'text-blue-400 bg-gray-700' : 'text-white/80 hover:text-blue-400 hover:bg-gray-700'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <button 
                        onClick={handleRulesClick} 
                        title="Rules and Guidelines" 
                        className="p-2 text-white/80 hover:text-blue-400 transition duration-200 hover:scale-110 rounded-full hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.207 5 7.5 5A6.5 6.5 0 003 11.5c0 1.61.856 3.024 2.138 3.868A8.442 8.442 0 007.5 15c1.173 0 2.274-.351 3.235-.96C11.668 14.523 12 14.023 12 13.5v-7.247zM12 6.253v13c1.168.747 2.793 1.253 4.5 1.253A6.5 6.5 0 0021 17.5c0-1.61-.856-3.024-2.138-3.868A8.442 8.442 0 0016.5 15c-1.173 0-2.274-.351-3.235-.96C12.332 14.523 12 14.023 12 13.5v-7.247z" /></svg>
                    </button>
                    <button onClick={() => setShowProfile(true)} className="p-1 border-2 border-blue-400 rounded-full transition hover:scale-105 active:scale-95 shadow-md shadow-blue-500/50">
                        <img src="https://i.pravatar.cc/70?img=11" alt="User Profile" className="w-8 h-8 rounded-full object-cover"/>
                    </button>
                </div>
            </div>
        </header>
        
        {/* --- Search and Filter Controls (CONDITIONAL VISIBILITY) --- */}
        <div className={`w-full bg-gray-900/90 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 py-4 border-b border-gray-700' : 'max-h-0 opacity-0 py-0'}`}>
            <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search Contributor Name..." 
                        value={searchQuery} 
                        onChange={e=>setSearchQuery(e.target.value)} 
                        className={inputSelectClass + " w-full pl-10"}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </div>
                <select value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)} className={inputSelectClass + " w-full sm:w-auto"}>
                    <option value="All">All Departments</option>
                    {allDepartments.map(dep=><option key={dep} value={dep}>{dep}</option>)}
                </select>
                <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className={inputSelectClass + " w-full sm:w-auto"}>
                    <option value="All">All Roles</option>
                    {availableRoles.map(role=><option key={role} value={role}>{role}</option>)}
                </select>
            </div>
        </div>

        {/* --- Today / Weekly / Monthly Tabs --- */}
        <div className="w-full bg-gray-900/80 p-4 shadow-inner border-t border-gray-800 z-10">
            <div className="flex justify-center max-w-6xl mx-auto space-x-3">
                {["Today", "Weekly","Monthly"].map(tab=>( 
                <button 
                    key={tab} 
                    className={`py-2 px-4 sm:px-6 rounded-full font-bold transition duration-300 text-sm md:text-base ${
                    activeTab === tab 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-300" 
                    : "bg-gray-700 text-gray-300 hover:bg-blue-900/50 hover:text-blue-400"
                    }`} 
                    onClick={()=>setActiveTab(tab)}
                >
                    {tab}
                </button>
                ))}
            </div>
        </div>
        
        {/* --- Main Leaderboard Content --- */}
        <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center relative z-10">
            
            <div className="w-full bg-gray-900/90 p-6 rounded-2xl shadow-2xl transition duration-300 transform border border-blue-900/50 mt-6">
                
                <h2 className="text-3xl font-extrabold text-white mb-6 flex items-center justify-between border-b border-gray-700 pb-3">
                    Leaderboard: {activeTab} 
                    <span className="ml-2 text-4xl text-blue-500 [text-shadow:_0_0_8px_rgba(59,130,246,0.5)]">🔥</span>
                </h2>

                {/* --- Top 3 Podium Spotlight (Dramatic Animated Blocks) --- */}
                {hasResults ? (
                    <div className="pb-10 -mb-4">
                        <p className="text-center text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Top 3 Contributors</p>
                        <div className="flex justify-center items-end h-[400px] w-full max-w-lg mx-auto mt-16 sm:mt-20"> 
                            {/* Rank 2 (Left - Medium Height) - delayIndex 1 */}
                            <PodiumItem user={rank2} rank={2} currentUserName={CURRENT_USER_NAME} animate={animatePodium} delayIndex={1} />
                            {/* Rank 1 (Center - Full Height) - delayIndex 2 */}
                            <PodiumItem user={rank1} rank={1} currentUserName={CURRENT_USER_NAME} animate={animatePodium} delayIndex={2} />
                            {/* Rank 3 (Right - Short Height) - delayIndex 3 */}
                            <PodiumItem user={rank3} rank={3} currentUserName={CURRENT_USER_NAME} animate={animatePodium} delayIndex={3} />
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 p-8">No results match your current filters.</p>
                )}
                
                {/* Contributor List (Ranks 4 onwards) */}
                <div className="flex flex-col gap-3 pt-6 border-t border-gray-700 mt-8">
                    <p className="text-sm font-extrabold text-blue-400 mb-2 border-b border-gray-800 pb-2 uppercase tracking-wider">Ranks 4 and Beyond</p>
                    {/* Displaying next 10 ranks (Ranks 4 to 13) */}
                    {visibleList.map(user=>(
                        <LeaderboardItem key={user.name} user={user} />
                    ))}

                    {/* Fallback to show current user if they are ranked outside the visible list (rank > 13) */}
                    {isCurrentUserOutsideVisibleList && (
                        <>
                            <div className="text-center text-gray-600 my-4 text-sm font-bold">--- You are ranked # {currentUser.rank} ---</div>
                            <LeaderboardItem user={currentUser} />
                        </>
                    )}

                    {/* Show a 'More' indicator if there are more users */}
                    {hasMoreUsers && (
                        <div className="text-center text-gray-600 my-4 text-sm font-bold">...and <span className="text-gray-400">{filteredData.length - visibleList.length - (isCurrentUserOutsideVisibleList ? 1 : 0)}</span> more contenders...</div>
                    )}
                </div>

                {/* Current User Progress (If user exists) */}
                {currentUser && (
                    <div className="mt-8 p-4 bg-blue-900/50 rounded-xl shadow-lg text-center text-sm font-medium border border-blue-500/50 transition duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/50">
                        <p className="text-gray-200 mb-2">
                            Your Current Rank: <span className="font-extrabold text-blue-400 text-lg">#{currentUser.rank}</span> | Earned XP: <span className="text-purple-400 font-extrabold text-lg">{currentUser.points}</span>
                        </p>
                        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full shadow-inner transition-all duration-1000 ease-out" 
                              style={{ 
                                  width: `${currentUser.completed}%` 
                              }}
                            ></div>
                        </div>
                        <p className="text-xs text-blue-400 font-bold mt-2">
                            {currentUser.completed}% progress this {activeTab === 'Weekly' ? 'Week' : (activeTab === 'Monthly' ? 'Month' : 'Day')}
                        </p>
                    </div>
                )}
            </div>
            
        </div>

        {/* Footer / Action Button */}
        <div className="mt-8 w-full max-w-sm mb-12 relative z-10">
            <button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-green-400/50 transition duration-300 active:scale-[0.98] transform flex items-center justify-center text-lg uppercase tracking-wider [text-shadow:_0_0_5px_rgba(0,0,0,0.5)]"
                onClick={() => console.log("Contribute & Earn XP clicked.")}
            >
                ➕ Contribute & Earn XP
            </button>
        </div>
        
        {/* --- Profile Sidebar Call --- */}
        {showProfile && <ProfileSidebar user={currentUser} onClose={() => setShowProfile(false)} onLogout={handleLogout} />}
        
        {/* --- Rules Modal Call --- */}
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}

    </div>
  );
};

export default LeaderboardPanel;
