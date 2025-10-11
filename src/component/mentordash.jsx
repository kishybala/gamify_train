// src/pages/MentorDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Award,
  LogOut,
  Users,
  Home,
  User,
  Zap,
  Menu,
  Trash2,
  Bell,
  CheckCircle,
} from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// --- Task Card for Mentor with Volunteers & Approve/Reject ---
const TaskCard = ({ task, onRemoveTask, onApprove, onReject }) => {
  const progressPercent = Math.min(
    100,
    (task.volunteersList.length / task.required) * 100
  );
  const isReady = task.status === "Ready";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between h-full relative transform hover:scale-105 transition-all duration-300">
      <button
        onClick={() => onRemoveTask(task.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        title="Remove Task"
      >
        <Trash2 className="w-5 h-5" />
      </button>

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
          <span className="font-semibold">Deadline:</span> {task.deadline || "N/A"}
        </p>

        <div className="mb-4 h-2 bg-green-200 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Volunteers List */}
        <div className="text-xs text-gray-500 mb-5">
          <span className="font-bold text-gray-700">Volunteers:</span>{" "}
          {task.volunteersList.length > 0
            ? task.volunteersList.join(", ")
            : "None"}
        </div>

        {/* Approve / Reject buttons for Mentor */}
        {isReady && (
          <div className="flex space-x-2">
            <button
              onClick={() => onApprove(task.id)}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(task.id)}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition-all"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Mentor Dashboard ---
export default function MentorDashboard({ tasks, setTasks, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [blinkBell, setBlinkBell] = useState(false);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [currentUserData, setCurrentUserData] = useState(
    currentUser || storedUser || { role: "Mentor", name: "Mentor", id: null }
  );
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || currentUserData.profilePic || null
  );

  // ✅ Fetch real user data from Firebase
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
            role: userData.role || "Mentor",
          };
          console.log("Mentor Dashboard - Updated User Data:", updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUserData(updatedUser);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Notifications ---
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setNotifications((prev) => {
        const existingIds = prev.map((n) => n.id);
        const newNotifications = tasks
          .filter((t) => !existingIds.includes(t.id))
          .map((t) => ({ id: t.id, title: t.title, time: Date.now() }));
        return [...prev, ...newNotifications];
      });
      setBlinkBell(true);
      setTimeout(() => setBlinkBell(false), 3000);
    }
  }, [tasks]);

  // Normalize tasks: ensure unique ids for tasks coming from older versions/localStorage
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const normalized = tasks.map(t => ({
        ...t,
        id: t.id || (`task_${(t.createdAt ? new Date(t.createdAt).getTime() : Date.now())}_${Math.random().toString(36).slice(2,8)}`)
      }));
      // If ids were added, persist them
      const anyMissing = normalized.some((t, i) => t.id !== tasks[i].id);
      if (anyMissing) {
        setTasks(normalized);
        localStorage.setItem("dashboardTasks", JSON.stringify(normalized));
      }
    }
  }, [tasks, setTasks]);

  const handleRemoveTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
  };

  // --- Approve / Reject functions ---
  const handleApprove = (taskId) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "Approved" } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
  };

  const handleReject = (taskId) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "Rejected" } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
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
            <span className="text-2xl font-extrabold text-blue-600 mr-2">
              Mentor Dashboard
            </span>
            <div className="text-xl font-bold text-gray-800">
              Welcome,{" "}
              <span className="text-blue-600">{currentUserData.name}</span>!
            </div>
            <span className="text-sm text-gray-500">
              ({currentUserData.role})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-2" /> Dashboard
                </Link>
                <Link
                  to="/AddTask"
                  className="flex items-center px-4 py-3 hover:bg-pink-50 hover:text-pink-600 font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-2" /> Add Task
                </Link>
                <Link
                  to="/points"
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
                  className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 font-semibold rounded-b-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  <Trophy className="w-5 h-5 mr-2" /> Leaderboard
                </Link>
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

      {/* Task Board */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          All Tasks 📋
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRemoveTask={handleRemoveTask}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No tasks available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- AddTask page ---
export function AddTask({ tasks, setTasks }) {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [points, setPoints] = React.useState("");
  const [required, setRequired] = React.useState(1);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      title,
      desc,
      category,
      assignedTo,
      points,
      required: Number(required),
      volunteersList: [],
      status: "Ready",
      deadline: null,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
    navigate("/mentor-dashboard"); // redirect to Mentor Dashboard
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md"
      >
        <h2 className="text-2xl font-extrabold mb-4">Add New Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Required Volunteers"
          value={required}
          onChange={(e) => setRequired(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-all"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
