import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Award,
  LogOut,
  Users,
  Hand,
  CheckCircle,
  Home,
  User,
  Zap,
  Menu,
  Trash2,
  X,
  Bell
} from 'lucide-react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// --- TaskCard Component ---
const TaskCard = ({ task, onToggleVolunteer, currentUser, onRemoveTask }) => {
  const isVolunteered = task.volunteersList.includes(currentUser.name);
  const isFull = task.volunteersList.length >= task.required && !isVolunteered;
  const isReady = task.status === 'Ready';
  const isButtonDisabled = isReady || isFull;

  const progressPercent = Math.min(100, (task.volunteersList.length / task.required) * 100);

  const handleClick = () => onToggleVolunteer(task.id);

  let buttonContent, buttonClasses;
  if (isReady) {
    buttonContent = "Task Ready! Waiting for council approval.";
    buttonClasses = 'bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300';
  } else if (isVolunteered) {
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
      {(currentUser.role === "Council" || currentUser.role === "Mentor") && (
        <button
          onClick={() => onRemoveTask(task.id)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          title="Remove Task"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-extrabold text-gray-800">{task.title}</h3>
          <div className="flex space-x-2">
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{task.category}</span>
            <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ring-1 ${isReady ? 'bg-green-100 text-green-700 ring-green-300' : 'bg-blue-100 text-blue-700 ring-blue-300'}`}>
              {isReady && <CheckCircle className="w-4 h-4 mr-1" />}
              {task.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-2 text-sm">{task.desc}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Assigned To:</span> {task.assignedTo}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Points:</span> {task.points}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Deadline:</span> {task.deadline || 'N/A'}</p>

        <div className="mb-4 h-2 bg-green-200 rounded-full">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="text-xs text-gray-500 mb-5">
          <span className="font-bold text-gray-700">Volunteers:</span> {task.volunteersList.join(', ') || 'None'}
        </div>
      </div>

      {isReady ? (
        <div className="w-full text-center py-2 px-4 rounded-lg font-bold text-sm bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300">{buttonContent}</div>
      ) : (
        <button disabled={isButtonDisabled} onClick={handleClick} className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-bold text-lg ${buttonClasses}`}>
          {buttonContent}
        </button>
      )}
    </div>
  );
};

// --- Dashboard Component ---
export default function Dashboard({ tasks, setTasks, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [blinkBell, setBlinkBell] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(
    currentUser || JSON.parse(localStorage.getItem("currentUser")) || { role: "Guest", id: null, name: "Guest" }
  );
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || currentUserData.profilePic || null);
  const navigate = useNavigate();

  // ✅ Fetch real user data from Firebase (Option 2)
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
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUserData(updatedUser);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Show profile-only first
  useEffect(() => {
    const savedTasks = localStorage.getItem("dashboardTasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const timer = setTimeout(() => {
      setShowDashboard(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [setTasks]);

  // Notifications
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const newNotifications = tasks
          .filter(t => !existingIds.includes(t.id))
          .map(t => ({ id: t.id, title: t.title, time: Date.now() }));
        return [...prev, ...newNotifications];
      });

      if (tasks.some(t => !notifications.find(n => n.id === t.id))) {
        setBlinkBell(true);
        setTimeout(() => setBlinkBell(false), 3000);
      }

      localStorage.setItem("dashboardTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.time < 60000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleVolunteer = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const isVolunteered = task.volunteersList.includes(currentUserData.name);
        const updatedVolunteers = isVolunteered
          ? task.volunteersList.filter(name => name !== currentUserData.name)
          : [...task.volunteersList, currentUserData.name];
        return { ...task, volunteersList: updatedVolunteers };
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
  };

  const handleRemoveTask = (taskId) => {
    if (currentUserData.role === "Council" || currentUserData.role === "Mentor") {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
    } else {
      alert("You are not allowed to remove tasks.");
    }
  };

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

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      {/* Profile animation */}
      {!showDashboard ? (
        <div className="flex flex-col items-center justify-center h-screen text-center relative">
          <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-30">
            <source src="https://www.w3schools.com/howto/rain.mp4" type="video/mp4" />
          </video>
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={profilePic || "https://via.placeholder.com/90"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-green-400 object-cover mb-4 shadow-lg animate-bounce"
            />
            <h1 className="text-3xl font-bold text-green-700 animate-pulse">
              Welcome, {currentUserData.name || currentUserData.email} 🌸
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
                <label htmlFor="profileUpload" className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs">✏️</label>
                <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileChange} className="hidden" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-green-600 mr-2">
                  {currentUserData.name}
                </span>
                <div className="text-xl font-bold text-gray-800">
                  Welcome, <span className="text-green-600">{currentUserData.name}</span>!
                </div>
                <span className="text-sm text-gray-500">({currentUserData.role})</span>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md">
                <Zap className="w-5 h-5 mr-2" /> <span>Points: 0</span>
              </div>
              <div className="flex items-center bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-full shadow-md">
                <Award className="w-5 h-5 mr-2" /> <span>Badges: 0</span>
              </div>
              <button onClick={() => setModalOpen(true)} className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
                View Volunteers
              </button>

              {/* Menu */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                  <Menu className="w-6 h-6" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                    <Link to="/dashboard" className="flex items-center px-4 py-3 hover:bg-green-50 font-semibold"><Home className="w-5 h-5 mr-2" /> Dashboard</Link>
                    <Link to="/badges" className="flex items-center px-4 py-3 hover:bg-purple-50 font-semibold"><Award className="w-5 h-5 mr-2" /> Badges</Link>
                    <Link to="/leaderboard" className="flex items-center px-4 py-3 hover:bg-blue-50 font-semibold"><Trophy className="w-5 h-5 mr-2" /> Leaderboard</Link>
                    {(currentUserData.role === "Council" || currentUserData.role === "Mentor") && (
                      <Link to="/addtask" className="flex items-center px-4 py-3 hover:bg-pink-50 font-semibold"><User className="w-5 h-5 mr-2" /> Add Task</Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center px-4 py-3 w-full text-left hover:bg-red-50 font-semibold"><LogOut className="w-5 h-5 mr-2"/> Logout</button>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setBellOpen(!bellOpen)}
                  className={`flex items-center p-2 rounded-full hover:bg-gray-100 ${blinkBell ? 'animate-bounce' : ''}`}
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
                        <div key={n.id} className="px-4 py-2 text-sm border-b last:border-b-0">{n.title} added</div>
                      )) : <p className="px-4 py-2 text-gray-500">No notifications</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

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

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
              <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl relative shadow-xl">
                <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4">Volunteers List</h2>
                <div className="max-h-96 overflow-y-auto">
                  {tasks.map(task => (
                    <div key={task.id} className="mb-4 border-b pb-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-sm text-gray-500">Volunteers: {task.volunteersList.join(', ') || 'None'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
