import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, LogOut, Home, User, Zap, Menu, Search, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || { role: "Guest", id: null, name: "Guest" }
  );
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || currentUserData.profilePic || null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        })).filter(user => user.role !== "Mentor"); // Filter out mentors from leaderboard
        console.log("Students fetched:", usersList.length, "users (mentors excluded)");
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
      } else {
        // Fetch user's profile picture from Firestore
        const fetchProfilePic = async () => {
          try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().profilePic) {
              setProfilePic(userDoc.data().profilePic);
              localStorage.setItem("profilePic", userDoc.data().profilePic);
            } else {
              setProfilePic(null);
              localStorage.removeItem("profilePic");
            }
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        };
        fetchProfilePic();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  

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

  const handleRemoveProfile = async () => {
    setProfilePic(null);
    localStorage.removeItem("profilePic");
    try {
      if (currentUserData.id) {
        const userRef = doc(db, "users", currentUserData.id);
        await updateDoc(userRef, { profilePic: "" });
      }
    } catch (error) {
      console.error("Error removing profile picture in database:", error);
    }
  };



  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setShowLogoutConfirm(false);
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
            <button onClick={() => { setEditName(currentUserData.name || ""); setShowEditProfileModal(true); }} className="absolute bottom-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm hover:bg-blue-600 transition" title="Edit profile">✏️</button>
            <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileChange} className="hidden" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800">
              Welcome, <span className={currentUserData.role === "Mentor" ? "text-blue-600" : "text-green-600"}>{currentUserData.name}</span>!
            </div>
            <span className="text-sm text-gray-500">({currentUserData.role})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {
            // If the logged in user is a Mentor, hide the points pill and show a simple time-period toggle.

          
            currentUserData.role === 'Mentor' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTimePeriod('monthly')}
                  className={`px-3 py-2 rounded-full border ${timePeriod === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >Monthly</button>
                <button
                  onClick={() => setTimePeriod('all')}
                  className={`px-3 py-2 rounded-full border ${timePeriod === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >All time</button>
              </div>
            ) : (
              <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md hover:scale-105 transition">
                <Zap className="w-5 h-5 mr-2" /> <span>Points: {users.find(user => user.id === currentUserData.id)?.points || 0}</span>
              </div>
            )
          }

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
                    {/* Badges removed per project requirement */}
                    <Link
                      to="/leaderboard"
                      className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 font-semibold bg-green-50 text-green-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Trophy className="w-5 h-5 mr-2" /> Leaderboard
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 hover:text-red-600 font-semibold"
                    >
                      <LogOut className="w-5 h-5 mr-2" /> Logout
                    </button>
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
                    {/* Badges removed per project requirement */}
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
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 hover:text-red-600 font-semibold"
                    >
                      <LogOut className="w-5 h-5 mr-2" /> Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <div className="flex items-center gap-3">
                  <input type="file" id="profileUploadModal" accept="image/*" onChange={handleProfileChange} className="hidden" />
                  <label htmlFor="profileUploadModal" className="px-3 py-2 bg-blue-50 font-bold border rounded-md cursor-pointer">Choose Image</label>
                  {profilePic && (
                    <button onClick={handleRemoveProfile} className="px-3 py-1 bg-red-500 text-white rounded-md">Remove</button>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowEditProfileModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      const updated = { ...currentUserData, name: editName };
                      setCurrentUserData(updated);
                      localStorage.setItem('currentUser', JSON.stringify(updated));
                      if (currentUserData.id) {
                        const userRef = doc(db, 'users', currentUserData.id);
                        await updateDoc(userRef, { name: editName, profilePic: profilePic || '' });
                      }
                    } catch (err) {
                      console.error('Error saving profile changes:', err);
                    } finally {
                      setShowEditProfileModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure you want to logout? You will be returned to the login page.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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