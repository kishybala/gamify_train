import React, { useEffect, useState } from "react";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Award, LogOut, Home, User, Zap, Menu, Bell } from 'lucide-react';
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
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [timePeriod, setTimePeriod] = useState("monthly");

  const navigate = useNavigate();

  // Get current user to determine which dashboard to return to
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const dashboardPath = currentUser.role === "Mentor" ? "/mentor-dashboard" : "/dashboard";

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), orderBy("points", "desc"));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const updatedUser = {
            id: user.uid,
            name: userData.name || user.email,
            email: user.email,
            role: userData.role || "Student",
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUserData(updatedUser);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Notifications from dashboardTasks
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("dashboardTasks")) || [];
    if (savedTasks.length > 0) {
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const newNotifications = savedTasks
          .filter(t => !existingIds.includes(t.id))
          .map(t => ({ id: t.id, title: t.title, time: Date.now() }));
        return [...prev, ...newNotifications];
      });

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
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  // ✅ Time-based filtering logic with different users for different periods
  const getTimeFilteredUsers = (users, period) => {
    if (users.length === 0) return [];
    
    // Create different arrangements for different time periods
    let arrangedUsers = [...users];
    
    switch(period) {
      case "today":
        // Shuffle users for today - different top performers
        arrangedUsers = users.slice().sort(() => 0.5 - Math.random());
        break;
      case "weekly":
        // Reverse order for weekly - different ranking
        arrangedUsers = users.slice().reverse();
        break;
      case "monthly":
      default:
        // Original order for monthly
        arrangedUsers = users.slice();
        break;
    }
    
    return arrangedUsers;
  };

  // ✅ Filters
  const timeFilteredUsers = getTimeFilteredUsers(users, timePeriod);
  const filteredUsers = timeFilteredUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "All" || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // ✅ Get Top 3 users for podium
  const topThreeUsers = filteredUsers.slice(0, 3);

  return (

    <div className="min-h-screen p-6 bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate(dashboardPath)}
        className="mb-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
      
      <h1 className="text-3xl font-bold text-center mb-6">🏆 Leaderboard</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6">
        {users.length > 0 ? (
          <ul>
            {users.map((user, index) => (
              <li
                key={user.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"

    <div className="min-h-screen font-inter bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navbar/Header */}
      <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center animate-fadeIn">
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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 animate-slideDown">
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-20 animate-slideDown">
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
      <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-green-50 animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">🏆 Leaderboard</h1>

        {/* Time Period Selector */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex justify-center space-x-2 bg-white rounded-xl p-2 shadow-lg">
            {['today', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  timePeriod === period 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
>
              >
                {period === 'today' ? 'Today' : period === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium Display */}
        {topThreeUsers.length >= 1 && (
          <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">🌟 Top Performers ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}) 🌟</h2>
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* Second Place */}
              {topThreeUsers[1] && (
                <div className="text-center transform transition-all duration-500 hover:scale-105">
                  <div className="relative">
                    <div className="bg-gradient-to-b from-gray-300 to-gray-500 w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      <span className="text-white font-bold text-2xl">🥈</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-white rounded-full p-4 shadow-xl transform hover:rotate-1 transition-all duration-500 border-4 border-gray-400 hover:border-gray-500">
                    <img 
                      src={topThreeUsers[1].profilePic || "https://via.placeholder.com/60"} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 transition-transform duration-300 hover:scale-110"
                    />
                    <div className="text-sm font-bold text-gray-800">{topThreeUsers[1].name?.split(' ')[0] || topThreeUsers[1].email?.split('@')[0]}</div>
                    <div className="text-xs text-blue-600 font-semibold">{topThreeUsers[1].role || 'Student'}</div>
                    <div className="text-xs text-gray-500">{topThreeUsers[1].department || 'General'}</div>
                    <div className="text-gray-600 font-bold mt-1 text-sm">{topThreeUsers[1].points} pts</div>
                    <div className="text-xs text-gray-400 font-bold">Position: #2</div>
                  </div>
                </div>
              )}

              {/* First Place */}
              <div className="text-center transform transition-all duration-500 hover:scale-110">
                <div className="relative">
                  <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 w-32 h-32 rounded-full flex flex-col items-center justify-center mb-4 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                    <div className="text-3xl mb-1 animate-pulse">👑</div>
                    <span className="text-white font-bold text-lg">1st</span>
                  </div>
                  <div className="absolute -top-4 -left-2 w-8 h-8 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute -top-4 -right-2 w-6 h-6 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white rounded-full p-6 shadow-2xl transform hover:-rotate-1 transition-all duration-500 border-4 border-yellow-400 hover:border-yellow-500 relative">
                  <div className="absolute -top-1 -right-1 text-yellow-500 animate-pulse">✨</div>
                  <img 
                    src={topThreeUsers[0].profilePic || "https://via.placeholder.com/80"} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-yellow-400 transition-transform duration-300 hover:scale-105"
                  />
                  <div className="text-lg font-bold text-gray-800">{topThreeUsers[0].name?.split(' ')[0] || topThreeUsers[0].email?.split('@')[0]}</div>
                  <div className="text-sm text-blue-600 font-semibold">{topThreeUsers[0].role || 'Student'}</div>
                  <div className="text-xs text-gray-500">{topThreeUsers[0].department || 'General'}</div>
                  <div className="text-yellow-600 font-bold mt-2 text-lg">{topThreeUsers[0].points} pts</div>
                  <div className="text-sm text-yellow-600 font-bold">Position: #1</div>
                </div>
              </div>

              {/* Third Place */}
              {topThreeUsers[2] && (
                <div className="text-center transform transition-all duration-500 hover:scale-105">
                  <div className="relative">
                    <div className="bg-gradient-to-b from-amber-500 to-amber-700 w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      <span className="text-white font-bold text-2xl">🥉</span>
                    </div>
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-white rounded-full p-4 shadow-xl transform hover:-rotate-1 transition-all duration-500 border-4 border-amber-500 hover:border-amber-600">
                    <img 
                      src={topThreeUsers[2].profilePic || "https://via.placeholder.com/60"} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 transition-transform duration-300 hover:scale-110"
                    />
                    <div className="text-sm font-bold text-gray-800">{topThreeUsers[2].name?.split(' ')[0] || topThreeUsers[2].email?.split('@')[0]}</div>
                    <div className="text-xs text-blue-600 font-semibold">{topThreeUsers[2].role || 'Student'}</div>
                    <div className="text-xs text-gray-500">{topThreeUsers[2].department || 'General'}</div>
                    <div className="text-amber-600 font-bold mt-1 text-sm">{topThreeUsers[2].points} pts</div>
                    <div className="text-xs text-amber-600 font-bold">Position: #3</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Celebration text */}
            <div className="text-center mt-4">
              <p className="text-gray-600 font-medium">
                🎉 Congratulations to our champions! 🎉
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-4 animate-fadeIn">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-md transition"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-md transition"
          >
            <option value="All">All Roles</option>
            <option value="Council">Council</option>
            <option value="Mentor">Mentor</option>
            <option value="Student">Student</option>
          </select>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-md transition"
          >
            <option value="All">All Departments</option>
            <option value="Culture">Culture</option>
            <option value="Academic">Academic</option>
          </select>
        </div>

        {/* Complete Leaderboard List */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-4 text-gray-700">
            📊 Complete Rankings ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
          </h3>
          <div className="bg-white rounded-xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 animate-fade-in">
            {filteredUsers.length > 0 ? (
              <ul>
                {filteredUsers.map((user, index) => (
                  <li
                    key={user.id}
                    className={`flex justify-between items-center py-4 px-4 border-b last:border-b-0 rounded-lg transition-all duration-300 hover:scale-105 animate-slide-in-left ${
                      index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-l-4 border-yellow-400' 
                        : 'hover:bg-green-50'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`font-bold text-lg animate-bounce ${
                        index === 0 ? 'text-yellow-600' : 
                        index === 1 ? 'text-gray-500' : 
                        index === 2 ? 'text-amber-600' : 'text-gray-700'
                      }`}>
                        {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : `${index + 1}.`}
                      </span>
                      <img 
                        src={user.profilePic || "https://via.placeholder.com/50"} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.name || user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.role} • {user.department || 'General'}
                        </div>
                        <div className="text-xs text-blue-500 font-semibold">
                          Position: #{index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold transition-all duration-300 hover:scale-110 ${
                        index === 0 ? 'text-yellow-600 text-lg' : 
                        index === 1 ? 'text-gray-600' : 
                        index === 2 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {user.points} pts
                      </div>
                      {index < 3 && (
                        <div className="text-xs text-gray-400 animate-pulse">
                          Top {index + 1}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-gray-500 font-medium">No users match the current filters</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
