import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Award, LogOut, Home, User, Zap, Menu, Bell, Search, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [blinkBell, setBlinkBell] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || { role: "Guest", id: null, name: "Guest" }
  );
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || currentUserData.profilePic || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Helper function to get profile image with fallback logic
  const getProfileImage = (user) => {
    // For current user, prioritize localStorage
    if (user.id === currentUserData.id) {
      return localStorage.getItem("profilePic") || user.profilePic || "https://via.placeholder.com/100";
    }
    // For other users, use their database profilePic
    return user.profilePic || "https://via.placeholder.com/100";
  };
  const [timePeriod, setTimePeriod] = useState("monthly");

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Starting to fetch users...");
        const q = query(collection(db, "users"), orderBy("points", "desc"));
        const querySnapshot = await getDocs(q);
        console.log("Users query successful, processing data...");
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Users fetched:", usersList.length, "users");
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setUsers([]); // Set empty array on error
      }
    };

    fetchUsers();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    if (savedTasks.length > 0) {
      setNotifications(savedTasks.map(task => ({ id: task.id, title: task.title, time: Date.now() })));
      setBlinkBell(true);
      setTimeout(() => setBlinkBell(false), 3000);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const filtered = prev.filter(n => Date.now() - n.time < 60000);
        // Only update if there's actually a change
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 5000); // Changed from 1000 to 5000 (5 seconds)
    return () => clearInterval(interval);
  }, []);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    
    if (searchOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOpen]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setProfilePic(reader.result);
        localStorage.setItem("profilePic", reader.result);
        
        // Also save to Firestore
        if (currentUserData.id) {
          try {
            const userRef = doc(db, "users", currentUserData.id);
            await updateDoc(userRef, {
              profilePic: reader.result
            });
            
            // Update the users list to reflect the new profile picture
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === currentUserData.id 
                  ? { ...user, profilePic: reader.result }
                  : user
              )
            );
          } catch (error) {
            console.error("Error updating profile picture in database:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigate to user profile
  const handleUserClick = (user) => {
    console.log("User clicked:", user);
    // Store selected user data for profile page
    localStorage.setItem("selectedUserProfile", JSON.stringify(user));
    console.log("Navigating to user profile...");
    navigate("/user-profile");
  };

  // Filter users based on search term only
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const name = user.name || user.email || "";
    
    return name.toLowerCase().includes(searchLower);
  });

  // Get Top 3 users for podium
  const topThreeUsers = filteredUsers.slice(0, 3);

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      {/* ✅ Mentor Dashboard Style Header */}
      <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center transform transition-all hover:shadow-2xl duration-300">
        <div className="flex items-center space-x-4">
          <div className="relative w-30 h-30">
            <img
              src={profilePic || "https://via.placeholder.com/90"}
              alt="Profile"
              className="w-30 h-30 rounded-full object-cover border-2 border-gray-300 transform hover:scale-105 transition-all duration-300"
            />
            <label
              htmlFor="profileUpload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs"
            >
              ✏️
            </label>
            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              onChange={handleProfileChange}
              className="hidden"
            />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800">
              Welcome, <span className={currentUserData.role === "Mentor" ? "text-blue-600" : "text-green-600"}>{currentUserData.name}</span>!
            </div>
            <span className="text-sm text-gray-500">({currentUserData.role})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <div className="relative">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="flex items-center text-gray-600 hover:text-blue-500 transition duration-150 p-2 rounded-full hover:bg-gray-100"
              title="Search Users"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center text-gray-600 hover:text-blue-500 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                {/* Show different menu based on role */}
                {currentUserData.role === "Mentor" ? (
                  <>
                    <Link
                      to="/mentor-dashboard"
                      className="flex items-center px-4 py-3 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Home className="w-5 h-5 mr-2" /> Dashboard
                    </Link>
                    <Link
                      to="/addtask"
                      className="flex items-center px-4 py-3 hover:bg-pink-50 hover:text-pink-600 font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-2" /> Add Task
                    </Link>
                    <Link
                      to="/Point"
                      className="flex items-center px-4 py-3 hover:bg-yellow-50 hover:text-yellow-600 font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Zap className="w-5 h-5 mr-2" /> Give Points
                    </Link>
                    <Link
                      to="/badges"
                      className="flex items-center px-4 py-3 hover:bg-purple-50 hover:text-purple-600 font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Award className="w-5 h-5 mr-2" /> Badges
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 font-semibold bg-green-50 text-green-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Trophy className="w-5 h-5 mr-2" /> Leaderboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 font-semibold transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Home className="w-5 h-5 mr-2" /> Dashboard
                    </Link>
                    <Link 
                      to="/badges" 
                      className="flex items-center px-4 py-3 hover:bg-purple-50 hover:text-purple-600 font-semibold transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Award className="w-5 h-5 mr-2" /> Badges
                    </Link>
                    <Link 
                      to="/leaderboard" 
                      className="flex items-center px-4 py-3 hover:bg-blue-50 hover:text-blue-600 font-semibold bg-blue-50 text-blue-600 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Trophy className="w-5 h-5 mr-2" /> Leaderboard
                    </Link>
                    {(currentUserData.role === "Council") && (
                      <Link 
                        to="/addtask" 
                        className="flex items-center px-4 py-3 hover:bg-pink-50 hover:text-pink-600 font-semibold transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="w-5 h-5 mr-2" /> Add Task
                      </Link>
                    )}
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 hover:text-red-600 font-semibold rounded-b-xl"
                >
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className={`flex items-center text-gray-600 transition duration-150 p-2 rounded-full hover:bg-gray-100 ${
                blinkBell ? "animate-bounce" : ""
              }`}
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                <h3 className="px-4 py-2 font-bold border-b">Notifications</h3>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications
                      .slice()
                      .reverse()
                      .map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-2 text-sm border-b last:border-b-0"
                        >
                          {n.title} added
                        </div>
                      ))
                  ) : (
                    <p className="px-4 py-2 text-gray-500">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="fixed top-20 left-0 right-0 z-50 px-6">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Search Users</h3>
                <p className="text-xs text-gray-500">Find users on the leaderboard</p>
              </div>
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type name to search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-center placeholder-gray-400"
              autoFocus
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                searchTerm 
                  ? filteredUsers.length > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {searchTerm 
                  ? `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found` 
                  : '🔍 Start typing to search'}
              </span>
              <span className="text-xs text-gray-400">Press ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Leaderboard Content with consistent styling */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          🏆 Leaderboard
        </h2>



        {/* Top 3 Podium Display */}
        {topThreeUsers.length >= 1 && (
          <div className="max-w-5xl mx-auto mb-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              🎯 Top Performers ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}) 🎯
            </h2>
            <div className="flex justify-center items-center space-x-8 mb-8">
              
              {/* Second Place */}
              {topThreeUsers[1] && (
                <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105 group">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <span className="text-3xl">🥈</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-gray-200 max-w-xs text-center">
                    <img 
                      src={getProfileImage(topThreeUsers[1])} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-3 border-gray-300 shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{topThreeUsers[1].name?.split(' ')[0] || topThreeUsers[1].email?.split('@')[0]}</h3>
                    <div className="bg-gray-100 rounded-full px-4 py-2 mb-3">
                      <span className="text-lg font-bold text-gray-700">{topThreeUsers[1].points} pts</span>
                    </div>
                    <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">2nd Place</div>
                  </div>
                </div>
              )}

              {/* First Place */}
              <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-110 group z-10">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex flex-col items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                    <div className="text-2xl animate-bounce mb-1">👑</div>
                    <span className="text-white font-bold text-sm">WINNER</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 border-2 border-yellow-300 max-w-sm text-center">
                  <img 
                    src={getProfileImage(topThreeUsers[0])} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-yellow-400 shadow-xl group-hover:scale-125 transition-transform duration-300"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{topThreeUsers[0].name?.split(' ')[0] || topThreeUsers[0].email?.split('@')[0]}</h3>
                  <div className="bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full px-6 py-3 mb-4">
                    <span className="text-xl font-bold text-yellow-800">{topThreeUsers[0].points} pts</span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-base font-bold animate-pulse">🏆 WINNER 🏆</div>
                </div>
              </div>

              {/* Third Place */}
              {topThreeUsers[2] && (
                <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105 group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <span className="text-2xl">🥉</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-5 shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-orange-200 max-w-xs text-center">
                    <img 
                      src={getProfileImage(topThreeUsers[2])} 
                      alt="Profile" 
                      className="w-18 h-18 rounded-full object-cover mx-auto mb-3 border-2 border-orange-300 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-base font-bold text-gray-800 mb-2">{topThreeUsers[2].name?.split(' ')[0] || topThreeUsers[2].email?.split('@')[0]}</h3>
                    <div className="bg-orange-100 rounded-full px-3 py-2 mb-3">
                      <span className="text-base font-bold text-orange-700">{topThreeUsers[2].points} pts</span>
                    </div>
                    <div className="bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">3rd Place</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Complete Rankings */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">📊 Complete Rankings</h2>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="grid grid-cols-4 gap-4 font-bold text-center">
                <span>Rank</span>
                <span>Profile</span>
                <span>Name</span>
                <span>Points</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div key={user.id || index} 
                       onClick={() => handleUserClick(user)}
                       className={`grid grid-cols-4 gap-4 p-4 text-center items-center hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-md ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 font-semibold' : ''
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white animate-pulse' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex justify-center">
                      <img 
                        src={getProfileImage(user)} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      />
                    </div>
                    
                    <div className="font-medium text-gray-800">
                      {user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Unknown'}
                    </div>
                    
                    <div className={`font-bold ${
                      index < 3 ? 'text-orange-600 text-lg' : 'text-gray-700'
                    }`}>
                      {user.points || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}