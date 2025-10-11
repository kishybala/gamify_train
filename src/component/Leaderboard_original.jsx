import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Award, LogOut, Home, User, Zap, Menu, Bell } from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Leaderboard() {
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
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [timePeriod, setTimePeriod] = useState("monthly");

  const navigate = useNavigate();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
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

      if (savedTasks.some(t => !notifications.find(n => n.id === t.id))) {
        setBlinkBell(true);
        setTimeout(() => setBlinkBell(false), 3000);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.time < 60000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
        localStorage.setItem("profilePic", reader.result);
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

  // Filter users based on search term, role, and department
  const filteredUsers = users.filter(user => {
    if (!searchTerm && roleFilter === "All" && departmentFilter === "All") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.name?.toLowerCase().includes(searchLower) || 
                         user.email?.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "All" || user.department === departmentFilter;
    
    return (!searchTerm || matchesSearch) && matchesRole && matchesDepartment;
  });

  // Get Top 3 users for podium
  const topThreeUsers = filteredUsers.slice(0, 3);

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navbar/Header */}
      <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative w-30 h-30">
            <img
              src={profilePic || "https://via.placeholder.com/90"}
              alt="Profile"
              className="w-30 h-30 rounded-full object-cover border-2 border-gray-300 transform hover:scale-105 transition-all duration-300"
            />
            <label htmlFor="profileUpload" className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs hover:bg-blue-600 transition">
              ✏️
            </label>
            <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileChange} className="hidden" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800">
              Welcome, <span className="text-green-600">{currentUserData.name}</span>!
            </div>
            <span className="text-sm text-gray-500">({currentUserData.role})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md hover:scale-105 transition">
            <Zap className="w-5 h-5 mr-2" /> <span>Points: 0</span>
          </div>
          <div className="flex items-center bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-full shadow-md hover:scale-105 transition">
            <Award className="w-5 h-5 mr-2" /> <span>Badges: 0</span>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-100 transition">
              <Menu className="w-6 h-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-20">
                <Link to="/dashboard" className="flex items-center px-4 py-3 hover:bg-green-50 font-semibold transition"><Home className="w-5 h-5 mr-2" /> Dashboard</Link>
                <Link to="/badges" className="flex items-center px-4 py-3 hover:bg-purple-50 font-semibold transition"><Award className="w-5 h-5 mr-2" /> Badges</Link>
                <Link to="/leaderboard" className="flex items-center px-4 py-3 hover:bg-blue-50 font-semibold transition"><Trophy className="w-5 h-5 mr-2" /> Leaderboard</Link>
                {(currentUserData.role === "Council" || currentUserData.role === "Mentor") && (
                  <Link to="/AddTask" className="flex items-center px-4 py-3 hover:bg-pink-50 font-semibold transition"><User className="w-5 h-5 mr-2" /> Add Task</Link>
                )}
                <button onClick={handleLogout} className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 font-semibold transition"><LogOut className="w-5 h-5 mr-2"/> Logout</button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className={`flex items-center p-2 rounded-full hover:bg-gray-100 transition ${blinkBell ? 'animate-bounce' : ''}`}
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
                  {notifications.length > 0 ? notifications.slice().reverse().map(n => (
                    <div key={n.id} className="px-4 py-2 text-sm border-b last:border-b-0 hover:bg-gray-50">{n.title} added</div>
                  )) : <p className="px-4 py-2 text-gray-500">No notifications</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Leaderboard Filters & Content --- */}
      <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-green-50">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">🏆 Leaderboard</h1>

        {/* Search Filter */}
        <div className="max-w-lg mx-auto mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-md transition text-center"
          />
        </div>

        {/* Role & Department Filters */}
        <div className="flex justify-center mb-6 space-x-4">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Mentor">Mentor</option>
            <option value="Council">Council</option>
          </select>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Departments</option>
            <option value="Tech">Tech</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

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
                      src={topThreeUsers[1].profilePic || "https://via.placeholder.com/80"} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-3 border-gray-300 shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{topThreeUsers[1].name?.split(' ')[0] || topThreeUsers[1].email?.split('@')[0]}</h3>
                    <p className="text-sm text-gray-600 mb-2">{topThreeUsers[1].role} | {topThreeUsers[1].department}</p>
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
                    src={topThreeUsers[0].profilePic || "https://via.placeholder.com/100"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-yellow-400 shadow-xl group-hover:scale-125 transition-transform duration-300"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{topThreeUsers[0].name?.split(' ')[0] || topThreeUsers[0].email?.split('@')[0]}</h3>
                  <p className="text-md text-gray-600 mb-3">{topThreeUsers[0].role} | {topThreeUsers[0].department}</p>
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
                      src={topThreeUsers[2].profilePic || "https://via.placeholder.com/70"} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-3 border-orange-300 shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                    <h3 className="text-base font-bold text-gray-800 mb-2">{topThreeUsers[2].name?.split(' ')[0] || topThreeUsers[2].email?.split('@')[0]}</h3>
                    <p className="text-xs text-gray-600 mb-2">{topThreeUsers[2].role} | {topThreeUsers[2].department}</p>
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
              <div className="grid grid-cols-6 gap-4 font-bold text-center">
                <span>Rank</span>
                <span>Profile</span>
                <span>Name</span>
                <span>Role</span>
                <span>Department</span>
                <span>Points</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div key={user.id || index} className={`grid grid-cols-6 gap-4 p-4 text-center items-center hover:bg-gray-50 transition-all duration-300 ${
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
                        src={user.profilePic || "https://via.placeholder.com/40"} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      />
                    </div>
                    
                    <div className="font-medium text-gray-800">
                      {user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Unknown'}
                    </div>
                    
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      user.role === 'Council' ? 'bg-red-100 text-red-700' :
                      user.role === 'Mentor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role || 'Student'}
                    </div>
                    
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      user.department === 'Tech' ? 'bg-purple-100 text-purple-700' :
                      user.department === 'Design' ? 'bg-pink-100 text-pink-700' :
                      user.department === 'Marketing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.department || 'General'}
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