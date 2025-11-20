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
  X,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";

// --- Student Profile Modal Component ---
const StudentProfileModal = ({ studentName, isOpen, onClose, onStudentSelect }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentName) {
      fetchStudentData();
    }
  }, [isOpen, studentName]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Search for student by name
      const usersQuery = query(
        collection(db, "users"), 
        where("name", "==", studentName)
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setStudentData({ id: doc.id, ...doc.data() });
      } else {
        setStudentData(null);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setStudentData(null);
    }
    setLoading(false);
  };

  const getProfileImage = (user) => {
    // If user has profilePic in database, use it
    if (user && user.profilePic) {
      return user.profilePic;
    }
    
    // For current user, check localStorage as fallback
    const currentUserData = JSON.parse(localStorage.getItem("currentUser")) || {};
    if (user && user.id === currentUserData.id) {
      const localProfilePic = localStorage.getItem("profilePic");
      if (localProfilePic) {
        return localProfilePic;
      }
    }
    
    return "https://via.placeholder.com/150";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Student Profile</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Student Profile...</p>
            </div>
          ) : studentData ? (
            <>
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img 
                    src={getProfileImage(studentData)} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg mx-auto"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mt-4">
                  {studentData.name || "Unknown Student"}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                  studentData.role === 'Council' ? 'bg-red-200 text-red-800' :
                  studentData.role === 'Mentor' ? 'bg-green-200 text-green-800' : 
                  'bg-blue-200 text-blue-800'
                }`}>
                  {studentData.role || 'Student'}
                </span>
              </div>

              {/* Points Display */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {studentData.points || 0}
                  </div>
                  <div className="text-sm text-orange-700">Total Points</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                {studentData.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Email</div>
                      <div className="text-gray-600 text-sm">{studentData.email}</div>
                    </div>
                  </div>
                )}

                {studentData.department && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Department</div>
                      <div className="text-gray-600 text-sm">{studentData.department}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action to view full profile */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    localStorage.setItem("selectedUserProfile", JSON.stringify(studentData));
                    window.open('/user-profile', '_blank');
                  }}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Student profile not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Task Card for Mentor with Volunteers ---
const TaskCard = ({ task, onRemoveTask, onStudentClick }) => {
  // Use memberNumber as required if task.required is not set
  const requiredMembers = task.required || task.memberNumber || 1;
  
  // Ensure volunteersList exists (for older tasks compatibility)
  const volunteers = task.volunteersList || [];
  
  // Debug log
  console.log("TaskCard render:", {
    taskTitle: task.title,
    volunteersList: volunteers,
    volunteersLength: volunteers.length,
    requiredMembers
  });
  
  const progressPercent = Math.min(
    100,
    (volunteers.length / requiredMembers) * 100
  );

  // Show only required number of volunteers
  const displayedVolunteers = volunteers.slice(0, requiredMembers);

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
            <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              {task.status || "Active"}
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
          {displayedVolunteers.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayedVolunteers.map((volunteer, index) => (
                <button
                  key={index}
                  onClick={() => onStudentClick(volunteer)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  {volunteer}
                </button>
              ))}
            </div>
          ) : (
            "None"
          )}
        </div>
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
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
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

  // Sync tasks from localStorage (for volunteer updates from student dashboard)
  useEffect(() => {
    const syncTasksFromStorage = () => {
      const storedTasks = JSON.parse(localStorage.getItem("dashboardTasks") || "[]");
      // Always sync - even if empty array, to handle task removal
      const normalizedTasks = storedTasks.map(task => ({
        ...task,
        volunteersList: task.volunteersList || [],
        status: task.status || "Ready"
      }));
      
      // Only update if there's actually a difference to prevent infinite re-renders
      const currentTasksString = JSON.stringify(tasks);
      const newTasksString = JSON.stringify(normalizedTasks);
      
      if (currentTasksString !== newTasksString) {
        console.log("Syncing tasks from localStorage:", normalizedTasks);
        setTasks(normalizedTasks);
      }
    };

    // Initial sync on component mount
    syncTasksFromStorage();

    // Listen for localStorage changes (cross-tab syncing)
    const handleStorageChange = (e) => {
      if (e.key === "dashboardTasks") {
        console.log("localStorage dashboardTasks changed externally, syncing...");
        syncTasksFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // More frequent checking for same-tab updates
    const interval = setInterval(() => {
      const currentStoredTasks = localStorage.getItem("dashboardTasks");
      const currentInMemoryTasks = JSON.stringify(tasks);
      
      if (currentStoredTasks && currentStoredTasks !== currentInMemoryTasks) {
        console.log("Periodic sync: tasks changed, updating...");
        syncTasksFromStorage();
      }
    }, 1000); // Check every second for better responsiveness

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [tasks, setTasks]); // Include tasks in dependency to prevent stale closures

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
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this task? This will remove it from all students' dashboards as well.");
    
    if (confirmDelete) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
      
      // Trigger storage event to sync with other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dashboardTasks',
        newValue: JSON.stringify(updatedTasks),
        oldValue: JSON.stringify(tasks)
      }));
      
      console.log("Task deleted:", taskId);
    }
  };

  // --- Student Profile Modal handlers ---
  const handleStudentClick = (studentName) => {
    setSelectedStudentName(studentName);
    setStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setStudentModalOpen(false);
    setSelectedStudentName("");
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
            <div className="text-xl font-bold text-gray-800">
              Welcome, <span className="text-blue-600">{getDisplayName(currentUserData)}</span>!
            </div>
            <span className="text-sm text-gray-500">({currentUserData.role})</span>
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
                onStudentClick={handleStudentClick}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No tasks available.
            </p>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        studentName={selectedStudentName}
        isOpen={studentModalOpen}
        onClose={handleCloseStudentModal}
      />
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
