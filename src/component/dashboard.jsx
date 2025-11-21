import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  LogOut,
  Users,
  Hand,
  CheckCircle,
  Home,
  User,
  Zap,
  Menu,
  X,
  Bell,
  Trash2
} from 'lucide-react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// --- TaskCard Component ---
const TaskCard = ({ task, onToggleVolunteer, currentUser, onRemoveTask }) => {
  const isVolunteered = task.volunteersList.includes(currentUser.name);
  const isFull = task.volunteersList.length >= task.required && !isVolunteered;

  const progressPercent = Math.min(100, (task.volunteersList.length / task.required) * 100);

  const handleClick = () => onToggleVolunteer(task.id);

  let buttonContent, buttonClasses;
  if (isVolunteered) {
    buttonContent = <> <Hand className="w-5 h-5 mr-2 rotate-180" /> Lower Hand </>;
    buttonClasses = 'bg-red-500 text-white hover:bg-red-600 shadow-md transform hover:scale-105 transition-all';
  } else if (isFull) {
    buttonContent = <> <Users className="w-5 h-5 mr-2" /> Mission Full </>;
    buttonClasses = 'bg-gray-400 text-white cursor-not-allowed shadow-inner';
  } else {
    buttonContent = <> <Hand className="w-5 h-5 mr-2" /> Raise Hand </>;
    buttonClasses = 'bg-green-500 text-white hover:bg-green-600 shadow-md transform hover:scale-105 transition-all';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between h-full relative transform hover:scale-105 transition-all duration-300">
      {/* Delete button only for Council and Mentor, completely removed for students */}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-extrabold text-gray-800">{task.title}</h3>
          <div className="flex space-x-2">
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{task.category}</span>
            {task.status !== 'Pending' && (
              <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ring-1 ${isReady ? 'bg-green-100 text-green-700 ring-green-300' : 'bg-blue-100 text-blue-700 ring-blue-300'}`}>
                {isReady && <CheckCircle className="w-4 h-4 mr-1" />}
                {task.status}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-2 text-sm">{task.desc}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Assign Department:</span> {task.assignedTo}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Points:</span> {task.points}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Deadline:</span> {task.deadline || 'N/A'}</p>
        <p className="text-gray-700 mb-2 text-sm">
          <span className="font-semibold">Member Number:</span> {task.memberNumber || 'N/A'}
        </p>


        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-medium text-gray-600">
              {task.volunteersList.length}/{task.required} volunteers
            </span>
          </div>
          <div className="h-2 bg-green-200 rounded-full">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Only show volunteers to Council/Mentor, not to students */}
        {(currentUser.role === "Council" || currentUser.role === "Mentor") && (
          <div className="text-xs text-gray-500 mb-5">
            <span className="font-bold text-gray-700">Volunteers:</span> {task.volunteersList.join(', ') || 'None'}
          </div>
        )}
      </div>

      <button disabled={isFull} onClick={handleClick} className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-bold text-lg ${buttonClasses}`}>
        {buttonContent}
      </button>
    </div>
  );
};

// --- Dashboard Component ---
export default function Dashboard({ tasks, setTasks, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(
    currentUser || JSON.parse(localStorage.getItem("currentUser")) || { role: "Guest", id: null, name: "Guest" }
  );
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || currentUserData.profilePic || null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();

  // Helper to produce a display name: prefer `name`, then derive from email local-part
  const getDisplayName = (user) => {
    if (!user) return 'User';
    if (user.name && String(user.name).trim()) return user.name;
    const email = user.email || '';
    const local = email.split('@')[0] || '';
    const clean = local.replace(/[0-9._-]/g, '');
    if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return 'User';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Helper function to extract first name from email
          const extractFirstName = (displayName, email) => {
            if (displayName && displayName.trim()) {
              return displayName.split(' ')[0];
            }
            if (email) {
              const emailPart = email.split('@')[0];
              const cleanName = emailPart.replace(/[0-9._-]/g, '');
              return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            }
            return "User";
          };
          
          const firstName = userData.name || extractFirstName(user.displayName, user.email);
          const updatedUser = {
            id: user.uid,
            name: firstName,
            email: user.email,
            role: userData.role || "Student",
            points: userData.points || 0,
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUserData(updatedUser);
          
          // Fetch user's profile picture from Firestore
          if (userData.profilePic) {
            setProfilePic(userData.profilePic);
            localStorage.setItem("profilePic", userData.profilePic);
          } else {
            setProfilePic(null);
            localStorage.removeItem("profilePic");
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync tasks from localStorage (for deleted tasks from mentor dashboard)
  useEffect(() => {
    const syncTasksFromStorage = () => {
      const storedTasks = JSON.parse(localStorage.getItem("dashboardTasks") || "[]");
      console.log("Student Dashboard: Syncing tasks from localStorage:", storedTasks);
      setTasks(storedTasks);
    };

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "dashboardTasks") {
        console.log("Student Dashboard: localStorage tasks changed, syncing...");
        syncTasksFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for updates
    const interval = setInterval(syncTasksFromStorage, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [setTasks]);

  // Show profile animation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDashboard(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  

  const handleToggleVolunteer = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const isVolunteered = task.volunteersList.includes(currentUserData.name);
        const updatedVolunteers = isVolunteered
          ? task.volunteersList.filter(name => name !== currentUserData.name)
          : [...task.volunteersList, currentUserData.name];
        
        return { 
          ...task, 
          volunteersList: updatedVolunteers
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
    
    // Trigger storage event for real-time sync with mentor dashboard
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dashboardTasks',
      newValue: JSON.stringify(updatedTasks),
      oldValue: JSON.stringify(tasks)
    }));
  };

  const handleRemoveTask = (taskId) => {
    if (currentUserData.role === "Council" || currentUserData.role === "Mentor") {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone and will remove the task from all student dashboards as well."
      );
      
      if (isConfirmed) {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        
        // Update state first
        setTasks(updatedTasks);
        
        // Then update localStorage with retry mechanism
        try {
          localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
          console.log("Task deleted and localStorage updated:", taskId);
        } catch (error) {
          console.error("Error updating localStorage:", error);
          // Retry once
          setTimeout(() => {
            try {
              localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }, 100);
        }
        
        // Also trigger a storage event to sync with other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'dashboardTasks',
          newValue: JSON.stringify(updatedTasks),
          oldValue: JSON.stringify(tasks)
        }));
        
        console.log("Task permanently deleted:", taskId);
      }
    } else {
      alert("You are not allowed to remove tasks.");
    }
  };

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
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      {/* Profile animation */}
      {!showDashboard ? (
        <div className="flex flex-col items-center justify-center h-screen text-center relative">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30">
            <source src="/s.mp4" type="video/mp4" />
          </video>
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={profilePic || "https://via.placeholder.com/90"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-green-400 object-cover mb-4 shadow-lg animate-bounce"
            />
            <h1 className="text-3xl font-bold text-green-700 animate-pulse">
              Welcome, {getDisplayName(currentUserData)} 🌸
            </h1>
            <p className="text-gray-600 mt-2 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard Header */}
          <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative w-30 h-30">
                <img
                  src={profilePic || "https://via.placeholder.com/90"}
                  alt="Profile"
                  className="w-30 h-30 rounded-full object-cover border-2 border-gray-300 transform hover:scale-105 transition-all duration-300"
                />
                <button
                  onClick={() => {
                    const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    setEditName(stored.name || currentUserData.name || '');
                    setShowEditProfileModal(true);
                  }}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm hover:bg-blue-600 transition"
                  title="Edit profile"
                >
                  ✏️
                </button>
                <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileChange} className="hidden" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">
                  Welcome, <span className="text-green-600">{getDisplayName(currentUserData)}</span>!
                </div>
                <span className="text-sm text-gray-500">({currentUserData.role})</span>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md">
                <Zap className="w-5 h-5 mr-2" /> <span>Points: {currentUserData.points || 0}</span>
              </div>
             

              {/* Menu */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                  <Menu className="w-6 h-6" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                    <Link to="/dashboard" className="flex items-center px-4 py-3 hover:bg-green-50 font-semibold"><Home className="w-5 h-5 mr-2" /> Dashboard</Link>
                    <Link to="/leaderboard" className="flex items-center px-4 py-3 hover:bg-blue-50 font-semibold"><Trophy className="w-5 h-5 mr-2" /> Leaderboard</Link>
                    {(currentUserData.role === "Council" || currentUserData.role === "Mentor") && (
                      <Link to="/addtask" className="flex items-center px-4 py-3 hover:bg-pink-50 font-semibold"><User className="w-5 h-5 mr-2" /> Add Task</Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 font-semibold"><LogOut className="w-5 h-5 mr-2" /> Logout</button>
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

          {/* Task Board */}
          <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Task Board ✏️</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.length > 0 ? tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleVolunteer={handleToggleVolunteer}
                  onRemoveTask={handleRemoveTask}
                  currentUser={currentUserData}
                />
              )) : <p className="text-gray-500 col-span-full text-center">No tasks yet. Council can add tasks!</p>}
            </div>
          </div>

          
        </>
      )}
    </div>
  );
}
