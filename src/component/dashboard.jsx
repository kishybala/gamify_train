// ✅ src/component/dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  X
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// --- TaskCard Component ---
const TaskCard = ({ task, onToggleVolunteer, userData, onRemoveTask }) => {
  const isVolunteered = task.volunteersList.includes(userData?.name);
  const isFull = task.volunteersList.length >= task.required && !isVolunteered;
  const isReady = task.status === "Ready";
  const isButtonDisabled = isReady || isFull;

  const progressPercent = Math.min(
    100,
    (task.volunteersList.length / task.required) * 100
  );

  const handleClick = () => onToggleVolunteer(task.id);

  let buttonContent, buttonClasses;
  if (isReady) {
    buttonContent = "Task Ready! Waiting for council approval.";
    buttonClasses =
      "bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300";
  } else if (isVolunteered) {
    buttonContent = (
      <>
        <Hand className="w-5 h-5 mr-2 rotate-180" /> Lower Hand
      </>
    );
    buttonClasses = "bg-red-500 text-white hover:bg-red-600 shadow-md";
  } else if (isFull) {
    buttonContent = (
      <>
        <Users className="w-5 h-5 mr-2" /> Mission Full
      </>
    );
    buttonClasses = "bg-gray-400 text-white cursor-not-allowed shadow-inner";
  } else {
    buttonContent = (
      <>
        <Hand className="w-5 h-5 mr-2" /> Raise Hand
      </>
    );
    buttonClasses = "bg-green-500 text-white hover:bg-green-600 shadow-md";
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between h-full relative">
      {(userData?.role === "Council" || userData?.role === "Mentor") && (
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
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {task.category}
            </span>
            <span
              className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ring-1 ${
                isReady
                  ? "bg-green-100 text-green-700 ring-green-300"
                  : "bg-blue-100 text-blue-700 ring-blue-300"
              }`}
            >
              {isReady && <CheckCircle className="w-4 h-4 mr-1" />}
              {task.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-2 text-sm">{task.desc}</p>
        <p className="text-gray-700 mb-2 text-sm">
          <span className="font-semibold">Assigned To:</span> {task.assignedTo}
        </p>
        <p className="text-gray-700 mb-2 text-sm">
          <span className="font-semibold">Points:</span> {task.points}
        </p>
        <p className="text-gray-700 mb-2 text-sm">
          <span className="font-semibold">Deadline:</span>{" "}
          {task.deadline || "N/A"}
        </p>

        <div className="mb-4 h-2 bg-green-200 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="text-xs text-gray-500 mb-5">
          <span className="font-bold text-gray-700">Volunteers:</span>{" "}
          {task.volunteersList.join(", ") || "None"}
        </div>
      </div>

      {isReady ? (
        <div className="w-full text-center py-2 px-4 rounded-lg font-bold text-sm bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300">
          {buttonContent}
        </div>
      ) : (
        <button
          disabled={isButtonDisabled}
          onClick={handleClick}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-bold text-lg ${buttonClasses}`}
        >
          {buttonContent}
        </button>
      )}
    </div>
  );
};

// --- Dashboard Component ---
export default function Dashboard({ tasks, setTasks }) {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || null
  );

  // ✅ Fetch user data from Firestore after login
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        console.warn("No user document found for:", currentUser.uid);
      }
    };
    fetchUserData();
  }, [currentUser]);

  // ✅ Load saved tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("dashboardTasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, [setTasks]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      localStorage.setItem("dashboardTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleToggleVolunteer = (taskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const isVolunteered = task.volunteersList.includes(userData?.name);
        const updatedVolunteers = isVolunteered
          ? task.volunteersList.filter((name) => name !== userData?.name)
          : [...task.volunteersList, userData?.name];
        return { ...task, volunteersList: updatedVolunteers };
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
  };

  const handleRemoveTask = (taskId) => {
    if (userData?.role === "Council" || userData?.role === "Mentor") {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
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
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background: "linear-gradient(135deg, #e0f2f1 0%, #fffde7 100%)",
        }}
      ></div>
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative w-30 h-30">
              <img
                src={profilePic || "https://via.placeholder.com/90"}
                alt="Profile"
                className="w-30 h-30 rounded-full object-cover border-2 border-gray-300"
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
              <span className="text-2xl font-extrabold text-green-600 mr-2">
                Campus Heroine
              </span>
              {userData ? (
                <>
                  <div className="text-xl font-bold text-gray-800">
                    Welcome,{" "}
                    <span className="text-green-600">{userData.name}</span>!
                  </div>
                  <span className="text-sm text-gray-500">
                    ({userData.role || "Student"})
                  </span>
                </>
              ) : (
                <div className="text-gray-500">Loading profile...</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md">
              <Zap className="w-5 h-5 mr-2" /> <span>Points: 0</span>
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-full shadow-md">
              <Award className="w-5 h-5 mr-2" /> <span>Badges: 0</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              View Volunteers
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center text-gray-600 hover:text-green-500 transition duration-150 p-2 rounded-full hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 rounded-t-xl font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-5 h-5 mr-2" /> Dashboard
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
                    className="flex items-center px-4 py-3 hover:bg-blue-50 hover:text-blue-600 font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Trophy className="w-5 h-5 mr-2" /> Leaderboard
                  </Link>
                  {(userData?.role === "Council" ||
                    userData?.role === "Mentor") && (
                    <Link
                      to="/AddTask"
                      className="flex items-center px-4 py-3 hover:bg-pink-50 hover:text-pink-600 font-semibold rounded-b-xl"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-2" /> Add Task
                    </Link>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-500 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-1" />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* TASK BOARD */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
            Task Board ✏️
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleVolunteer={handleToggleVolunteer}
                  onRemoveTask={handleRemoveTask}
                  userData={userData}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                No tasks yet. Council can add tasks!
              </p>
            )}
          </div>
        </div>

        {/* VOLUNTEER MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl relative shadow-xl">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Volunteers List</h2>
              <div className="max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="mb-4 border-b pb-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Volunteers: {task.volunteersList.join(", ") || "None"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
