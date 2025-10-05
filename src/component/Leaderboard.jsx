import React, { useState, useMemo } from "react";
// Since this is a single file context, we assume a mock navigate function
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

// --- Data Definitions ---
const WEEKLY_DATA = [
  { name: "Elara Vance", points: 2150, role: "Student", department: "Academic", avatar: "https://i.pravatar.cc/70?img=1", badges: ["gold", "star", "warrior"], streak: 8 },
  { name: "Marcus Chen", points: 1980, role: "Student", department: "Sports", avatar: "https://i.pravatar.cc/70?img=2", badges: ["silver", "warrior"], streak: 4 },
  { name: "Sana Khan", points: 1520, role: "Mentor", department: "Academic", avatar: "https://i.pravatar.cc/70?img=3", badges: ["bronze", "star"], streak: 6 },
  { name: "David Lee", points: 1250, role: "Student", department: "Cultural", avatar: "https://i.pravatar.cc/70?img=4", badges: ["bronze"], streak: 3 },
  { name: "Ruchi Sharma", points: 880, role: "Student", department: "Academic", avatar: "https://i.pravatar.cc/70?img=5", badges: ["star"], streak: 5 },
];

const MONTHLY_DATA = [
  { name: "Sophia R.", points: 4100, role: "Council", department: "Academic", avatar: "https://i.pravatar.cc/70?img=6", badges: ["gold"], streak: 12 },
  { name: "Liam O'Connell", points: 3950, role: "Student", department: "Sports", avatar: "https://i.pravatar.cc/70?img=7", badges: ["silver"], streak: 8 },
  { name: "Ruchi Sharma", points: 3800, role: "Student", department: "Academic", avatar: "https://i.pravatar.cc/70?img=5", badges: ["star"], streak: 10 },
  { name: "Anjali Kumari", points: 3600, role: "Student", department: "Cultural", avatar: "https://i.pravatar.cc/70?img=8", badges: ["bronze"], streak: 5 },
  { name: "Kriti Kumari", points: 3400, role: "Student", department: "Academic", avatar: "https://i.pravatar.cc/70?img=9", badges: ["bronze"], streak: 6 },
];

const CURRENT_USER_NAME = "Ruchi Sharma";
const MEDALS = {1: "🥇",2: "🥈",3: "🥉"};
const BADGE_ICONS = { gold: "👑", silver: "✨", bronze: "🥉", star: "⭐", warrior: "🌿" };
// ------------------------------------------

// Custom Tailwind Utility Classes for Reusability and Aesthetics
const inputSelectClass = "p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full md:w-auto transition duration-150 ease-in-out";
const avatarClass = "w-14 h-14 rounded-full shadow-md object-cover";

// Helper function to dynamically set spotlight card border color
const getSpotlightBorder = (rank) => {
    switch (rank) {
        case 1: return "border-yellow-400";
        case 2: return "border-gray-300";
        case 3: return "border-yellow-700";
        default: return "border-blue-400";
    }
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Weekly");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const dataSource = activeTab === "Weekly" ? WEEKLY_DATA : MONTHLY_DATA;

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
    data.sort((a,b)=>b.points-a.points);
    return data.map((user,index)=>({...user, rank:index+1}));
  }, [departmentFilter, roleFilter, searchQuery, dataSource]);

  const top3 = filteredData.slice(0,3);
  const list = filteredData.slice(3);
  const currentUser = filteredData.find((u) => u.name===CURRENT_USER_NAME);
  // Calculate XP needed for the user to reach the next rank (rank - 1)
  const xpToNextRank = currentUser ? Math.max(0,(filteredData[currentUser.rank-2]?.points||0)-currentUser.points) : 0;
  // Calculate progress for the bar (based on distance to the rank below)
  const previousRankPoints = filteredData[currentUser?.rank]?.points || 0;
  const currentRankPoints = currentUser?.points || 0;
  const nextRankPoints = filteredData[currentUser?.rank - 2]?.points || currentRankPoints;
  const totalDifference = nextRankPoints - previousRankPoints;
  const currentProgress = totalDifference > 0 ? ((currentRankPoints - previousRankPoints) / totalDifference) * 100 : 100;

  return (
    // Outer Wrapper for the entire page container
    <div className="min-h-screen flex items-start justify-center p-4 bg-gray-50 font-sans">
      {/* Leaderboard Card */}
      <div className="w-full max-w-4xl bg-white p-6 md:p-8 rounded-2xl shadow-2xl text-center my-8 transition duration-300 transform hover:shadow-3xl">

        <h1 className="text-4xl font-extrabold text-blue-600 mb-6 flex items-center justify-center">
          Leaderboard <span className="ml-2">🏆</span>
        </h1>

        {/* Current User Profile Card */}
        {currentUser && (
          <div className={`flex items-center p-4 mb-6 rounded-xl border-l-4 border-blue-600 shadow-xl bg-blue-50 transition duration-300 hover:shadow-2xl`}>
            <img src={currentUser.avatar} alt={currentUser.name} className={avatarClass + " mr-4"}/>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-800">{currentUser.name} <span className="ml-2 text-blue-600">#{currentUser.rank}</span></h3>
              <p className="text-sm text-gray-600">{currentUser.role} - {currentUser.department}</p>
              <p className="text-lg font-mono text-green-600 my-1">{currentUser.points} XP</p>
              <div className="flex space-x-1 text-xl">
                {currentUser.badges.map(b=><span key={b} title={b}>{BADGE_ICONS[b]}</span>)}
              </div>
              <p className="text-sm text-orange-500 font-semibold mt-1">🔥 {currentUser.streak}-day streak</p>
            </div>
          </div>
        )}

        {/* Add Task Box */}
        <div 
          className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 mb-6 active:scale-95 transform"
          onClick={()=>navigate("/add-task")}
        >
          ➕ Add New Task (Contribute to the Leaderboard!)
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 space-x-3">
          {["Weekly","Monthly"].map(tab=>(
            <button 
              key={tab} 
              className={`py-2 px-6 rounded-full font-semibold transition duration-300 text-sm md:text-base ${
                activeTab === tab 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-300" 
                : "bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
              }`} 
              onClick={()=>setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <select value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)} className={inputSelectClass}>
            <option value="All">All Departments</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
          </select>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className={inputSelectClass}>
            <option value="All">All Roles</option>
            {availableRoles.map(role=><option key={role} value={role}>{role}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search contributor..." 
            value={searchQuery} 
            onChange={e=>setSearchQuery(e.target.value)} 
            className={inputSelectClass}
          />
        </div>

        {/* Top 3 Spotlight */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
          {top3.map(user=>(
            <div 
              key={user.name} 
              className={`col-span-1 relative bg-gradient-to-br from-white to-blue-50 p-4 rounded-xl shadow-xl border-t-4 ${getSpotlightBorder(user.rank)} transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-3xl">{MEDALS[user.rank]}</div>
              <img src={user.avatar} alt={user.name} className={avatarClass + " mx-auto mt-4 mb-2 ring-2 ring-offset-2 ring-blue-500"}/>
              <div className="user-info text-xs md:text-sm">
                <h3 className="font-extrabold text-gray-800 mt-1 truncate">{user.name}</h3>
                <p className="text-xs text-gray-500">{user.role}</p>
                <p className="font-bold text-base text-purple-600">{user.points} XP</p>
                <div className="flex justify-center space-x-1 text-lg my-1">
                  {user.badges.map(b=><span key={b} title={b}>{BADGE_ICONS[b]}</span>)}
                </div>
                <p className="text-xs text-orange-500">🔥 {user.streak}-day streak</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contributor List */}
        <div className="flex flex-col gap-3">
          {list.map(user=>(
            <div 
              key={user.name} 
              className={`flex items-center justify-between p-3 rounded-xl shadow-md transition duration-200 hover:shadow-lg hover:translate-x-0.5 text-sm ${
                user.name === CURRENT_USER_NAME 
                ? "bg-blue-100 border-l-4 border-blue-600 font-semibold" 
                : "bg-white"
              }`}
            >
              <div className="w-10 font-bold text-blue-600 text-lg">{user.rank}</div>
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full shadow-sm mx-2"/>
              <div className="flex-1 text-left font-medium text-gray-700 truncate">{user.name}</div>
              <div className="text-purple-600 font-bold w-20 text-right">{user.points} XP</div>
              <div className="flex space-x-1 text-base w-20 justify-end">
                {user.badges.map(b=><span key={b} title={b}>{BADGE_ICONS[b]}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Current User Progress */}
        {currentUser && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-xl shadow-inner text-center font-medium text-gray-700">
            <p className="text-base md:text-lg">
              You are <span className="text-blue-700 font-extrabold">#{currentUser.rank}</span> with <span className="text-green-600 font-extrabold">{currentUser.points} XP</span>. 
              {xpToNextRank > 0 
                ? ` You need ${xpToNextRank} XP more to reach the next rank!`
                : " You are currently Rank 1! Keep up the great work!"
              }
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
              {/* Progress Bar */}
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
