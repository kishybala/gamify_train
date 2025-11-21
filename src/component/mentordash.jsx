// src/pages/MentorDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  LogOut,
  Users,
  Home,
  User,
  Zap,
  Menu,
  Trash2,
  CheckCircle,
  X,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, orderBy, addDoc, deleteDoc } from "firebase/firestore";

// --- Student Profile Modal Component ---
const StudentProfileModal = ({ studentName, isOpen, onClose, onStudentSelect }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentName) {
      fetchStudentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentName]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, "users"), where("name", "==", studentName));
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const docItem = querySnapshot.docs[0];
        setStudentData({ id: docItem.id, ...docItem.data() });
      } else {
        setStudentData(null);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = (user) => {
    if (user && user.profilePic) return user.profilePic;
    const currentUserData = JSON.parse(localStorage.getItem("currentUser")) || {};
    if (user && user.id === currentUserData.id) return localStorage.getItem("profilePic") || "https://via.placeholder.com/150";
    return "https://via.placeholder.com/150";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Student Profile</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Student Profile...</p>
            </div>
          ) : studentData ? (
            <>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={getProfileImage(studentData)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mt-4">{studentData.name || 'Unknown Student'}</h3>
                <p className="text-sm text-gray-500 mt-1">{studentData.role || ''}</p>
              </div>

              <div className="space-y-3">
                {studentData.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg"><Mail className="w-4 h-4 text-blue-600" /></div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Email</div>
                      <div className="text-gray-600 text-sm">{studentData.email}</div>
                    </div>
                  </div>
                )}

                {studentData.department && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-4 h-4 text-purple-600" /></div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Department</div>
                      <div className="text-gray-600 text-sm">{studentData.department}</div>
                    </div>
                  </div>
                )}
              </div>

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
  
  // ✅ Ensure volunteersList exists and is an array (for older tasks compatibility)
  const volunteers = Array.isArray(task.volunteersList) ? task.volunteersList : [];
  
  // ✅ Enhanced debug log for volunteer tracking
  console.log("🎯 TaskCard render:", {
    taskId: task.id,
    taskTitle: task.title,
    volunteersList: volunteers,
    volunteersLength: volunteers.length,
    requiredMembers,
    rawVolunteers: task.volunteersList
  });
  
  const progressPercent = Math.min(
    100,
    (volunteers.length / requiredMembers) * 100
  );

  // Show only required number of volunteers
  const displayedVolunteers = volunteers.slice(0, requiredMembers);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between h-full relative transform hover:scale-105 transition-all duration-300">
      <button
        onClick={() => onRemoveTask(task.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        title="Remove Task"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 pr-8 sm:pr-0">{task.title}</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {task.category}
            </span>
            {task.status !== "Pending" && (
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
            )}
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

        {/* ✅ Enhanced Hand Raised Display */}
        <div className="text-xs text-gray-500 mb-5">
          <span className="font-bold text-gray-700">🙋‍♂️ Hand Raised:</span>{" "}
          {displayedVolunteers && displayedVolunteers.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayedVolunteers.map((volunteer, index) => {
                // ✅ Ensure volunteer is a string and not empty
                const volunteerName = String(volunteer || "Unknown").trim();
                if (!volunteerName || volunteerName === "Unknown") return null;
                
                return (
                  <button
                    key={`${task.id}-volunteer-${index}-${volunteerName}`}
                    onClick={() => onStudentClick(volunteerName)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border-2 border-green-300 shadow-sm"
                    title={`${volunteerName} raised hand! Click to view profile`}
                  >
                    🙋‍♂️ {volunteerName}
                  </button>
                );
              })}
              {/* ✅ Show status */}
              <span className="text-xs text-green-600 ml-2 font-semibold">
                ({displayedVolunteers.length}/{requiredMembers} raised)
                {displayedVolunteers.length >= requiredMembers && (
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    ✅ Complete
                  </span>
                )}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 italic">
              No hands raised yet (0/{requiredMembers})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Mentor Dashboard ---
export default function MentorDashboard({ tasks, setTasks, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [showMentorList, setShowMentorList] = useState(false);
  const [mentors, setMentors] = useState([]);
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

  // ✅ Fetch tasks from Firebase on component mount
  useEffect(() => {
    const fetchTasksFromFirebase = async () => {
      try {
        const tasksQuery = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(tasksQuery);
        const firebaseTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));
        
        // Normalize Firebase tasks
        const normalizedTasks = firebaseTasks.map(task => ({
          ...task,
          volunteersList: Array.isArray(task.volunteersList) ? task.volunteersList : [],
          status: task.status || "Ready",
          required: task.required || 1
        }));
        
        setTasks(normalizedTasks);
        // Also update localStorage with Firebase data for sync
        localStorage.setItem("dashboardTasks", JSON.stringify(normalizedTasks));
        console.log("✅ Tasks loaded from Firebase:", normalizedTasks.length);
      } catch (error) {
        console.error("❌ Error fetching tasks from Firebase:", error);
        // Fallback to localStorage if Firebase fails
        const storedTasks = localStorage.getItem("dashboardTasks");
        if (storedTasks) {
          try {
            const parsedTasks = JSON.parse(storedTasks);
            setTasks(parsedTasks);
          } catch (parseError) {
            console.error("Error parsing localStorage tasks:", parseError);
            setTasks([]);
          }
        } else {
          setTasks([]);
        }
      }
    };

    fetchTasksFromFirebase();
  }, []); // Run once on component mount

  // ✅ Force load tasks from localStorage on component mount (for page refresh)
  useEffect(() => {
    const loadTasksOnMount = () => {
      try {
        const storedTasks = localStorage.getItem("dashboardTasks");
        console.log("🔄 Loading tasks on mentor dashboard mount:", storedTasks);
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            const normalizedTasks = parsedTasks.map(task => ({
              ...task,
              volunteersList: Array.isArray(task.volunteersList) ? task.volunteersList : [],
              status: task.status || "Ready",
              required: task.required || task.memberNumber || 1
            }));
            console.log("✅ Mentor Dashboard - Loaded tasks with volunteers:", normalizedTasks);
            setTasks(normalizedTasks);
          } else {
            console.log("⚠️ No valid tasks found in localStorage");
            setTasks([]);
          }
        } else {
          console.log("⚠️ No tasks in localStorage");
          setTasks([]);
        }
      } catch (error) {
        console.error("❌ Error loading tasks on mount:", error);
        setTasks([]);
      }
    };
    
    // Load immediately on mount
    loadTasksOnMount();
    
    // Also load after a short delay to catch any async updates
    setTimeout(loadTasksOnMount, 500);
  }, []); // Empty dependency - run only once on mount

  // ✅ Enhanced volunteer sync from localStorage (for volunteer updates from student dashboard)
  useEffect(() => {
    const syncTasksFromStorage = () => {
      try {
        const currentStoredTasks = localStorage.getItem("dashboardTasks");
        console.log("🔄 Mentor Dashboard - Checking localStorage for updates:", currentStoredTasks);
        
        if (currentStoredTasks) {
          const parsedTasks = JSON.parse(currentStoredTasks);
          if (Array.isArray(parsedTasks)) {
            const normalizedTasks = parsedTasks.map(task => ({
              ...task,
              volunteersList: Array.isArray(task.volunteersList) ? task.volunteersList : [],
              status: task.status || "Ready",
              required: task.required || task.memberNumber || 1
            }));
            
            // Always update to ensure fresh volunteer data
            console.log("✅ Mentor Dashboard - Syncing tasks with volunteers:", normalizedTasks);
            setTasks(normalizedTasks);
          }
        }
      } catch (error) {
        console.error("❌ Error syncing tasks from localStorage:", error);
      }
    };

    // ✅ Initial sync on component mount - this is crucial for refresh
    syncTasksFromStorage();

    // ✅ Listen for localStorage changes (cross-tab syncing)
    const handleStorageChange = (e) => {
      if (e.key === "dashboardTasks") {
        console.log("🔄 Mentor Dashboard - localStorage dashboardTasks changed externally, syncing...");
        syncTasksFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // ✅ More frequent checking for same-tab updates (volunteer changes)
    const interval = setInterval(() => {
      const currentStoredTasks = localStorage.getItem("dashboardTasks");
      const currentInMemoryTasks = JSON.stringify(tasks);
      
      if (currentStoredTasks && currentStoredTasks !== currentInMemoryTasks) {
        console.log("🔄 Mentor Dashboard - Periodic sync: volunteer data changed, updating...");
        syncTasksFromStorage();
      }
    }, 1000); // ✅ Check every 1 second for faster volunteer updates

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [setTasks]); // Remove tasks from dependency to prevent infinite loops

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

  const handleRemoveTask = async (taskId) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this task? This will remove it from all students' dashboards as well.");
    
    if (confirmDelete) {
      try {
        // Delete from Firebase first
        await deleteDoc(doc(db, "tasks", taskId));
        
        // Update local state
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
        
        // Update localStorage
        localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
        
        // Trigger storage event to sync with other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'dashboardTasks',
          newValue: JSON.stringify(updatedTasks),
          oldValue: JSON.stringify(tasks)
        }));
        
        console.log("Task permanently deleted from Firebase and localStorage:", taskId);
      } catch (error) {
        console.error("Error deleting task from Firebase:", error);
        alert("Failed to delete task. Please try again.");
      }
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
  
  // Fetch all mentors
  const fetchMentors = async () => {
    try {
      const mentorsQuery = query(collection(db, "users"), where("role", "==", "Mentor"));
      const querySnapshot = await getDocs(mentorsQuery);
      const mentorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMentors(mentorsList);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      setMentors([]);
    }
  };

  // Fetch mentors when modal opens
  useEffect(() => {
    if (showMentorList) {
      fetchMentors();
    }
  }, [showMentorList]);

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
      <header className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 mb-4 sm:mb-6 mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <img
                src={profilePic || "https://via.placeholder.com/90"}
                alt="Profile"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-300 transform hover:scale-105 transition-all duration-300"
              />
              <button
                onClick={() => {
                  const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  setEditName(stored.name || currentUserData.name || '');
                  setShowEditProfileModal(true);
                }}
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer text-xs sm:text-sm hover:bg-blue-600 transition"
                title="Edit profile"
              >
                ✏️
              </button>
              <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileChange} className="hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl md:text-xl font-bold text-gray-800 truncate">
                Welcome, <span className="text-blue-600">{getDisplayName(currentUserData)}</span>!
              </div>
              <span className="text-xs sm:text-sm text-gray-500">({currentUserData.role})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mentor List Button */}
            <button
              onClick={() => setShowMentorList(!showMentorList)}
              className="flex items-center text-gray-600 hover:text-purple-500 transition duration-150 p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
              title="View All Mentors"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center text-gray-600 hover:text-blue-500 transition duration-150 p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                <Link
                  to="/mentor-dashboard"
                  className="flex items-center px-4 py-3 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl font-semibold bg-blue-50 text-blue-600"
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
      <div className="p-3 sm:p-4 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 mx-2 sm:mx-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 sm:mb-6">
          All Tasks 📋
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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

      {/* Mentor List Modal */}
      {showMentorList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">👥 All Mentors ({mentors.length})</h2>
                <button onClick={() => setShowMentorList(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {mentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-200">
                      <div className="text-center mb-4">
                        <div className="relative inline-block">
                          <img 
                            src={mentor.profilePic || "https://via.placeholder.com/80"} 
                            alt="Mentor" 
                            className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow-lg mx-auto" 
                          />
                          <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Mentor
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mt-3">{mentor.name || mentor.email?.split('@')[0] || 'Unknown'}</h3>
                      </div>

                      <div className="space-y-3">
                        {mentor.email && (
                          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                            <div className="p-2 bg-purple-100 rounded-lg"><Mail className="w-4 h-4 text-purple-600" /></div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">Email</div>
                              <div className="text-gray-600 text-sm truncate max-w-[200px]">{mentor.email}</div>
                            </div>
                          </div>
                        )}

                        {mentor.createdAt && (
                          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                            <div className="p-2 bg-green-100 rounded-lg"><Calendar className="w-4 h-4 text-green-600" /></div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">Joined</div>
                              <div className="text-gray-600 text-sm">
                                {mentor.createdAt?.toDate ? 
                                  mentor.createdAt.toDate().toLocaleDateString() : 
                                  'Recently'
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Mentors Found</h3>
                  <p className="text-gray-500">No mentors have signed up yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        title,
        desc,
        category,
        assignedTo,
        points,
        required: Number(required),
        volunteersList: [],
        status: "Ready",
        deadline: null,
        createdAt: new Date(),
        createdBy: JSON.parse(localStorage.getItem("currentUser"))?.id || "unknown"
      };
      
      // Add to Firebase first
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      
      // Add the Firebase ID to the task
      const taskWithId = { id: docRef.id, ...newTask };
      
      // Update local state
      const updatedTasks = [...tasks, taskWithId];
      setTasks(updatedTasks);
      
      // Also update localStorage for backup
      localStorage.setItem("dashboardTasks", JSON.stringify(updatedTasks));
      
      console.log("Task successfully saved to Firebase:", docRef.id);
      navigate("/mentor-dashboard"); // redirect to Mentor Dashboard
    } catch (error) {
      console.error("Error adding task to Firebase:", error);
      alert("Failed to save task. Please try again.");
    }
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
