import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Award,
  LogOut,
  Users,
  Home,
  User,
  Zap,
  Menu,
  Bell,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// --- GLOBAL VARIABLES (Mandatory) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;



// Mentor Dashboard Header Component
const MentorHeader = ({ currentUser, profilePic, onProfileChange, onLogout, onEditProfile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  
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

  return (
    <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center transform transition-all hover:shadow-2xl duration-300">
      <div className="flex items-center space-x-4">
        <div className="relative w-30 h-30">
          <img
            src={profilePic || "https://via.placeholder.com/90"}
            alt="Profile"
            className="w-30 h-30 rounded-full object-cover border-2 border-gray-300 transform hover:scale-105 transition-all duration-300"
          />
          <button
            onClick={() => onEditProfile()}
            className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs hover:bg-blue-600 transition"
            title="Edit profile"
          >
            ✏️
          </button>
          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            onChange={onProfileChange}
            className="hidden"
          />
        </div>
        <div>
          <div className="text-xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{getDisplayName(currentUser)}</span>!
          </div>
          <span className="text-sm text-gray-500">({currentUser?.role || 'Mentor'})</span>
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
                to="/mentor-dashboard"
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
                className="flex items-center px-4 py-3 hover:bg-yellow-50 hover:text-yellow-600 font-semibold bg-yellow-50 text-yellow-600"
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
                className="flex items-center px-4 py-3 hover:bg-green-50 hover:text-green-600 font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                <Trophy className="w-5 h-5 mr-2" /> Leaderboard
              </Link>
              <button
                onClick={onLogout}
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
            className="flex items-center text-gray-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
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
                    .map((n, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm border-b last:border-b-0"
                      >
                        {n.message}
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
  );
};

// Custom Hook for Firebase Authentication and User Management
const useAuthUser = () => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || { role: "Mentor", name: "Mentor", id: null }
  );
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || null
  );
  const navigate = useNavigate();

  // ✅ Fetch real user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        try {
          const docRef = doc(getFirestore(), "users", user.uid);
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
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setProfilePic(reader.result);
        localStorage.setItem("profilePic", reader.result);
        
        // Also save to Firestore
        if (currentUser.id) {
          try {
            const userRef = doc(getFirestore(), "users", currentUser.id);
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
      await signOut(getAuth());
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  return { currentUser, profilePic, handleProfileChange, handleLogout };
};
const generatePlaceholderUrl = (name = "", userId = null) => {
    // First check if user has uploaded profile image in localStorage for this userId
    if (userId) {
        const userProfileKey = `profilePic_${userId}`;
        const savedProfilePic = localStorage.getItem(userProfileKey);
        if (savedProfilePic) {
            return savedProfilePic;
        }
    }

    // Check for general profile picture by name
    const generalProfileKey = `profile_${name}`;
    const generalProfilePic = localStorage.getItem(generalProfileKey);
    if (generalProfilePic) {
        return generalProfilePic;
    }

    // Fallback: generate an initials-based placeholder with a stable color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hexColor = "000000".substring(0, 6 - color.length) + color;

    let initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    if (initials.length === 0) initials = 'U';

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${hexColor}&color=ffffff&size=100&format=svg`;
};

// Custom Hook for Firebase Initialization and Authentication
const useFirebase = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        try {
            const defaultFirebaseConfig = {
                apiKey: "AIzaSyArwJ46ilZz3PB4hknxPz7XGEw2zF5KUXI", authDomain: "gamify-station.firebaseapp.com", projectId: "gamify-station", storageBucket: "gamify-station.firebasestorage.app", messagingSenderId: "158401998275", appId: "1:158401998275:web:1f7d3cbbcae3ff726de176", measurementId: "G-6G1HQ8J64Z",
            };
            
            const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : defaultFirebaseConfig;

            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authentication = getAuth(app);

            setDb(firestore);
            setAuth(authentication);

            const authenticate = async () => {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(authentication, initialAuthToken);
                    } else {
                        await signInAnonymously(authentication);
                    }
                } catch (error) {
                    console.error("Firebase Auth Error: Failed to sign in with custom token, falling back to anonymous.", error);
                    await signInAnonymously(authentication);
                }
            };

            const unsubscribe = authentication.onAuthStateChanged(user => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    authenticate();
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Failed to initialize Firebase:", e);
        }
    }, []);

    return { db, auth, userId, isAuthReady };
};

// Custom Hook for fetching and tracking students
const useStudents = (db, isAuthReady) => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !isAuthReady) return;

        // Agar aapke students 'users' collection mein hain toh yeh path use karein:
        const studentsCollectionRef = collection(db, 'users');
        const studentQuery = query(studentsCollectionRef);

        const unsubscribe = onSnapshot(studentQuery, (snapshot) => {
            const studentList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data(), transactions: doc.data().transactions || [] }))
                .filter(user => user.role !== "Mentor"); // Filter out mentors from points section

            // Points ke hisaab se sort karein
            studentList.sort((a, b) => b.totalPoints - a.totalPoints);

            // Rank assign karein
            const rankedList = studentList.map((student, index) => ({
                ...student,
                rank: index + 1
            }));

            setStudents(rankedList);
            setIsLoading(false);
        }, (error) => {
            console.error("Listening for students failed:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, isAuthReady]);

    return { students, setStudents, isLoading };
};


// Compact Admin Edit Icon Component
const AdminEditIcon = ({ setNotification }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editProfilePic, setEditProfilePic] = useState('');

    const openEditMode = () => {
        console.log("AdminEditIcon: Opening edit mode...");
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
        console.log("AdminEditIcon: Current user:", currentUser);
        setEditName(currentUser.name || 'Admin');
        setEditProfilePic(localStorage.getItem("profilePic") || '');
        setIsEditMode(true);
        console.log("AdminEditIcon: Edit mode set to true");
    };

    const saveProfile = () => {
        if (editName.trim() === '') {
            setNotification({ message: "Name cannot be empty", type: 'error' });
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
        localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, name: editName }));
        
        if (editProfilePic) {
            localStorage.setItem("profilePic", editProfilePic);
        }

        setNotification({ message: "Profile updated successfully!", type: 'success' });
        setIsEditMode(false);
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditProfilePic(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isEditMode) {
        return (
            <button
                onClick={() => {
                    console.log("AdminEditIcon button clicked!");
                    openEditMode();
                }}
                className="absolute -bottom-3 -right-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border-2 border-white"
                title="Edit Profile"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                    <button 
                        onClick={() => setIsEditMode(false)} 
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <img
                                src={editProfilePic || "https://via.placeholder.com/100"}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-violet-200 shadow-lg"
                            />
                            <label className="absolute bottom-0 right-0 bg-violet-500 text-white p-2 rounded-full cursor-pointer hover:bg-violet-600 transition-colors shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture URL (Optional)</label>
                        <input
                            type="url"
                            value={editProfilePic}
                            onChange={(e) => setEditProfilePic(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                            placeholder="Enter image URL"
                        />
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={() => setIsEditMode(false)}
                            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveProfile}
                            className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Admin Profile Edit Component (Legacy)
const AdminProfileEdit = ({ setNotification }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editProfilePic, setEditProfilePic] = useState('');

    const openEditMode = () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
        setEditName(currentUser.name || 'Admin');
        setEditProfilePic(localStorage.getItem("profilePic") || '');
        setIsEditMode(true);
    };

    const saveProfile = () => {
        if (editName.trim() === '') {
            setNotification({ message: "Name cannot be empty", type: 'error' });
            return;
        }

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
        localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, name: editName }));
        
        if (editProfilePic) {
            localStorage.setItem("profilePic", editProfilePic);
        }

        setNotification({ message: "Profile updated successfully!", type: 'success' });
        setIsEditMode(false);
        
        // Force page refresh to show changes
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditProfilePic(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isEditMode) {
        return (
            <div className="fixed top-4 right-4 z-30">
                <button
                    onClick={openEditMode}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-60 flex items-end justify-center p-4 bg-black bg-opacity-50 sm:items-center">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 mb-8 sm:mb-0">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                    <button 
                        onClick={() => setIsEditMode(false)} 
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <img
                                src={editProfilePic || "https://via.placeholder.com/100"}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-violet-200 shadow-lg"
                            />
                            <label className="absolute bottom-0 right-0 bg-violet-500 text-white p-2 rounded-full cursor-pointer hover:bg-violet-600 transition-colors shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture URL (Optional)</label>
                        <input
                            type="url"
                            value={editProfilePic}
                            onChange={(e) => setEditProfilePic(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                            placeholder="Enter image URL"
                        />
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={() => setIsEditMode(false)}
                            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveProfile}
                            className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Custom Notification Toast Component
const NotificationToast = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;

    const baseClasses = "fixed bottom-4 right-4 z-[110] p-4 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 transform";
    const colorClasses = notification.type === 'error'
        ? 'bg-red-600'
        : notification.type === 'success'
            ? 'bg-green-600'
            : 'bg-indigo-600';

    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            {notification.message}
        </div>
    );
};

// Water Drop Animation Component
const WaterDropEffect = ({ effectKey }) => {
    const layers = useMemo(() => ([
        { size: 'w-4 h-4', delay: 0, duration: 'duration-700', color: 'bg-indigo-300' },
        { size: 'w-8 h-8', delay: 100, duration: 'duration-900', color: 'bg-purple-400' },
        { size: 'w-12 h-12', delay: 200, duration: 'duration-1000', color: 'bg-pink-500' },
    ]), []);

    useEffect(() => {
        layers.forEach((layer, index) => {
            const el = document.getElementById(`water-drop-${effectKey}-${index}`);
            if (el) {
                const initialDelay = 50 + layer.delay;

                const timeout1 = setTimeout(() => {
                    el.style.opacity = 1;
                    el.style.transform = 'scale(40)';

                    const timeout2 = setTimeout(() => {
                        el.style.opacity = 0;
                        el.style.transform = 'scale(50)';
                    }, 300);

                    return () => clearTimeout(timeout2);
                }, initialDelay);

                return () => clearTimeout(timeout1);
            }
        });
    }, [effectKey, layers]);


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {layers.map((layer, index) => (
                <div
                    key={index}
                    id={`water-drop-${effectKey}-${index}`}
                    className={`absolute ${layer.size} ${layer.color} rounded-full transition-all ${layer.duration} ease-out transform`}
                    style={{
                        opacity: 0,
                        transform: 'scale(0)',
                        willChange: 'transform, opacity',
                        boxShadow: '0 0 10px 5px rgba(120, 80, 200, 0.5)',
                        zIndex: index
                    }}
                />
            ))}
        </div>
    );
};


// Point Giver Sub-Component
const PointGiver = ({ db, student, adminId, onClose, setNotification, setStudents }) => {
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const pointOptions = [
        { 
            value: 5, 
            label: 'Excellent Work', 
            description: '+5 pts', 
            color: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700', 
            icon: '🌟'
        },
        { 
            value: 3, 
            label: 'Good Effort', 
            description: '+3 pts', 
            color: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700', 
            icon: '👏'
        },
        { 
            value: 2, 
            label: 'Team Player', 
            description: '+2 pts', 
            color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700', 
            icon: '🤝'
        },
        { 
            value: 1, 
            label: 'Creative Solution', 
            description: '+1 pt', 
            color: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700', 
            icon: '💡'
        },
        { 
            value: -1, 
            label: 'Minor Issue', 
            description: '-1 pt', 
            color: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700', 
            icon: '⚠️'
        },
        { 
            value: -3, 
            label: 'Needs Improvement', 
            description: '-3 pts', 
            color: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700', 
            icon: '❌'
        },
    ];

    const givePoints = async (p, r) => {
        console.log('givePoints called with:', { p, r, student: student?.name, db: !!db, isSaving });
        if (!db || !student || isSaving) {
            console.log('Early return from givePoints:', { db: !!db, student: !!student, isSaving });
            return;
        }

        setIsSaving(true);
        const pointsToAdd = p || points;
        const newReason = r || reason.trim();

        console.log('Processing points:', { pointsToAdd, newReason });

        if (pointsToAdd === 0 || newReason.length === 0) {
            console.log('Invalid points or reason:', { pointsToAdd, newReason });
            setNotification({ message: "Please select points and provide a reason.", type: 'error' });
            setIsSaving(false);
            return;
        }

        try {
            // MANDATORY: Use public path for shared data/leaderboard
            const studentRef = doc(db, `artifacts/${appId}/public/data/students`, student.id);
            const studentSnap = await getDoc(studentRef);

            const currentData = studentSnap.exists() ? studentSnap.data() : { totalPoints: 0, transactions: [] };
            const newTotalPoints = (currentData.totalPoints || 0) + pointsToAdd;

            const newTransaction = {
                timestamp: Date.now(),
                points: pointsToAdd,
                reason: newReason,
                adminId: adminId || 'unknown_admin',
            };

            // Firestore update
            await setDoc(studentRef, {
                name: student.name,
                email: student.email || null, // Keep existing fields
                profileImageUrl: student.profileImageUrl || null, // Preserve image URL
                totalPoints: newTotalPoints,
                lastUpdated: Date.now(),
                transactions: [...(currentData.transactions || []), newTransaction],
            }, { merge: true });

            // Instant local UI update (important for smooth feel)
            setStudents(prev => {
                console.log('Updating student list after point assignment');
                const updatedList = prev.map(s =>
                    s.id === student.id
                        ? { ...s, totalPoints: newTotalPoints, transactions: [...(s.transactions || []), newTransaction] }
                        : s
                );
                // Re-sort the list immediately
                updatedList.sort((a, b) => b.totalPoints - a.totalPoints);
                console.log('Student list updated:', updatedList.find(s => s.id === student.id));
                return updatedList;
            });

            console.log('Points assigned successfully:', { pointsToAdd, newReason, newTotalPoints });
            setNotification({ message: `${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} points assigned to ${student.name}!`, type: 'success' });
            setPoints(0);
            setReason('');
            setReason('');
            onClose(); // close panel
        } catch (error) {
            console.error("Error giving points:", error);
            setNotification({ message: "Failed to assign points. Check console for details.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleButtonClick = (option) => {
        console.log('Quick action button clicked:', option);
        setReason(option.label.split('(')[0].trim()); // Clean up reason for display
        givePoints(option.value, option.label.split('(')[0].trim());
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Point Assignment
                </h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {student.name}
                </span>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                    {pointOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleButtonClick(option)}
                            disabled={isSaving}
                            className={`${option.color} text-white p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 shadow-md relative overflow-hidden group`}
                        >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="text-2xl mb-1">{option.icon}</div>
                                <div className="font-bold text-sm">{option.label}</div>
                                <div className="text-xs opacity-90">{option.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Points Section */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Custom Assignment</h4>
                <div className="space-y-3">
                    <div className="flex space-x-3">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                                placeholder="Enter points (+/-)"
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="flex-2 flex-grow">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for points"
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={() => givePoints(points, reason)}
                        disabled={isSaving || points === 0 || reason.trim().length === 0}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Assign {points} Points</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- UPDATED COMPONENT: ImageSetter with setStudents prop ---
const ImageSetter = ({ db, student, setNotification, setStudents }) => {
    // Initialize with existing URL or empty string
    const [imageUrl, setImageUrl] = useState(student.profileImageUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const setProfileImage = async () => {
        if (!db || !student || isSaving) return;
        
        const urlToSave = imageUrl.trim();

        if (urlToSave.length > 0 && !urlToSave.startsWith('http')) {
            setNotification({ message: "Please enter a valid image URL starting with http or https.", type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            const studentRef = doc(db, `artifacts/${appId}/public/data/students`, student.id);
            
            const newImageUrl = urlToSave.length > 0 ? urlToSave : null;

            // Update Firestore with the new image URL
            await setDoc(studentRef, {
                profileImageUrl: newImageUrl
            }, { merge: true });
            
            // INSTANT LOCAL UI UPDATE: Update the main list so the card image refreshes immediately
             setStudents(prev => {
                const updatedList = prev.map(s =>
                    s.id === student.id
                        ? { ...s, profileImageUrl: newImageUrl }
                        : s
                );
                // Important: re-sort to maintain order if the structure of students state requires it
                updatedList.sort((a, b) => b.totalPoints - a.totalPoints);
                return updatedList;
            });


            setNotification({ message: urlToSave ? "Profile image URL saved and updated!" : "Profile image cleared!", type: 'success' });
        } catch (error) {
            console.error("Error setting image URL:", error);
            setNotification({ message: "Failed to set image URL. Check console.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 bg-purple-50/70 rounded-2xl shadow-inner border border-gray-100/50 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-purple-200 pb-2">
                Set Profile Image
            </h3>
            <div className="flex space-x-2">
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste Image URL (e.g., https://example.com/pic.jpg)"
                    className="flex-1 p-3 border-2 border-purple-200 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                    onClick={setProfileImage}
                    disabled={isSaving}
                    className="py-3 px-6 bg-purple-600 text-white font-bold rounded-xl transition duration-200 hover:bg-purple-700 hover:shadow-lg disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
            {imageUrl && (
                <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    {/* Fallback added here too for robustness */}
                    <img 
                        src={imageUrl} 
                        alt="Profile Preview" 
                        className="w-16 h-16 object-cover rounded-full mx-auto ring-2 ring-purple-400 shadow-md"
                        // Fallback to placeholder if the provided URL is invalid
                        onError={(e) => { e.target.onerror = null; e.target.src = generatePlaceholderUrl('Error'); }}
                    />
                </div>
            )}
        </div>
    );
};
// --- END UPDATED COMPONENT: ImageSetter ---


// Student Detail Panel
const StudentDetail = ({ student, onClose, db, adminId, setNotification, students, setStudents }) => {
    console.log('StudentDetail component rendering for:', student?.name);
    
    if (!student) {
        console.log('No student provided to StudentDetail');
        return <div>No student data</div>;
    }
    
    // Point tier styling
    let pointColorClass = 'text-violet-600';
    let bgGradient = 'from-violet-50 to-purple-50';
    
    if (student.totalPoints >= 50) {
        pointColorClass = 'text-yellow-600';
        bgGradient = 'from-yellow-50 to-amber-50';
    } else if (student.totalPoints >= 20) {
        pointColorClass = 'text-blue-600';
        bgGradient = 'from-blue-50 to-indigo-50';
    } else if (student.totalPoints < 0) {
        pointColorClass = 'text-red-600';
        bgGradient = 'from-red-50 to-rose-50';
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`bg-gradient-to-r ${bgGradient} px-6 py-4 border-b border-gray-200 flex-shrink-0`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <img
                            src={generatePlaceholderUrl(student.name, student.id)}
                            alt={`${student.name} profile`}
                            className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-lg"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{student.name}'s Profile</h2>
                            <p className="text-gray-600 font-medium">Student Performance Dashboard</p>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Closing student detail modal');
                            onClose();
                        }} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white/50 rounded-xl"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {/* Points Display */}
                <div className="px-6 py-6 text-center border-b border-gray-100">
                    <div className={`inline-flex items-baseline space-x-2 ${pointColorClass}`}>
                        <span className="text-5xl font-black">{student.totalPoints}</span>
                        <span className="text-lg font-semibold">Total Points</span>
                    </div>
                    <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                            Rank #{student.rank || 'N/A'}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {student.transactions?.length || 0} Transactions
                        </span>
                    </div>
                </div>

                {/* Point Assignment */}
                <div className="px-6 py-4">
                    <PointGiver
                        db={db}
                        student={student}
                        adminId={adminId}
                        onClose={onClose}
                        setNotification={setNotification}
                        setStudents={setStudents}
                    />
                </div>

                {/* Transaction History */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Transaction History
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                        {student.transactions && student.transactions.length > 0 ? (
                            <div className="space-y-2">
                                {student.transactions.slice().sort((a, b) => b.timestamp - a.timestamp).map((t, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-bold text-lg ${t.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.points > 0 ? `+${t.points}` : t.points}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">pts</span>
                                                </div>
                                                <p className="text-gray-700 font-medium mt-1">{t.reason}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(t.timestamp).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: 'numeric', 
                                                        minute: 'numeric',
                                                        hour12: true 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">No transaction history yet</p>
                                <p className="text-gray-400 text-sm mt-1">Points history will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Student Card Component
const StudentCard = ({ student, onClick, isSelected, isAnimating }) => {
    // Point-based styling with gradients
    let gradientClass = 'from-white via-gray-50 to-white';
    let borderClass = 'border-gray-200';
    let pointBadgeClass = 'bg-gray-100 text-gray-700';
    let shadowClass = 'shadow-lg hover:shadow-xl';
    
    if (student.totalPoints >= 50) {
        gradientClass = 'from-yellow-50 via-amber-50 to-yellow-100';
        borderClass = 'border-yellow-300';
        pointBadgeClass = 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
        shadowClass = 'shadow-yellow-200/50 shadow-lg hover:shadow-xl hover:shadow-yellow-300/60';
    } else if (student.totalPoints >= 20) {
        gradientClass = 'from-blue-50 via-indigo-50 to-blue-100';
        borderClass = 'border-blue-300';
        pointBadgeClass = 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white';
        shadowClass = 'shadow-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-300/60';
    } else if (student.totalPoints < 0) {
        gradientClass = 'from-red-50 via-rose-50 to-red-100';
        borderClass = 'border-red-300';
        pointBadgeClass = 'bg-gradient-to-r from-red-400 to-rose-500 text-white';
        shadowClass = 'shadow-red-200/50 shadow-lg hover:shadow-xl hover:shadow-red-300/60';
    } else {
        gradientClass = 'from-violet-50 via-purple-50 to-indigo-100';
        borderClass = 'border-violet-300';
        pointBadgeClass = 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
        shadowClass = 'shadow-violet-200/50 shadow-lg hover:shadow-xl hover:shadow-violet-300/60';
    }

    const cardClasses = `bg-gradient-to-br ${gradientClass} border-2 ${borderClass} rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${shadowClass} ${isSelected ? 'ring-4 ring-indigo-400 scale-105 shadow-2xl' : ''} ${isAnimating ? 'pointer-events-none opacity-80' : ''}`;

    return (
        <div
            className={cardClasses}
            onClick={() => {
                console.log('Student card clicked:', student.name, student.id);
                console.log('Calling onClick with student:', student);
                onClick(student);
            }}
        >
            {/* Top Section: Profile & Leader Badge */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={generatePlaceholderUrl(student.name, student.id)}
                            alt={`${student.name} profile`}
                            className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-lg"
                        />
                        {student.rank === 1 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg">
                                <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{student.name}</h3>
                        {student.rank === 1 && (
                            <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                🏆 Leader
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Points Badge */}
                <div className={`${pointBadgeClass} px-4 py-2 rounded-xl font-bold text-lg shadow-lg`}>
                    {student.totalPoints}
                    <span className="text-sm ml-1">pts</span>
                </div>
            </div>
            
            {/* Bottom Section: Action Hint */}
            <div className="flex items-center justify-between pt-3 border-t border-white/60">
                <span className="text-sm text-gray-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Manage Points
                </span>
                <svg className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
            
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const { db, userId, isAuthReady } = useFirebase();
    const { currentUser, profilePic, handleProfileChange, handleLogout } = useAuthUser();
    const [notification, setNotification] = useState(null); // Define notification state here
    
    // Pass setNotification to useStudents
    const { students, setStudents, isLoading } = useStudents(db, isAuthReady, setNotification);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationStudent, setAnimationStudent] = useState(null);
    const [effectKey, setEffectKey] = useState(0);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editName, setEditName] = useState("");

    // Debug selectedStudent changes
    useEffect(() => {
        console.log('selectedStudent changed:', selectedStudent?.name || 'null');
    }, [selectedStudent]);

    // Handle click to start the sequenced animation
    const handleStudentClick = useCallback((student) => {
        console.log('handleStudentClick called for:', student?.name, student?.id);
        
        if (!student) {
            console.log('No student provided to handleStudentClick');
            return;
        }
        
        if (selectedStudent && selectedStudent.id === student.id) {
            console.log('Same student clicked, closing modal');
            setSelectedStudent(null);
            return;
        }

        console.log('Setting selected student:', student.name);
        setSelectedStudent(student);
        console.log('Selected student set successfully');
        
        // Optional: Keep simple animation without complex timing
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    }, [isAnimating, selectedStudent]);

    // Generate Admin's profile details
    const adminPlaceholderUrl = useMemo(() => userId ? generatePlaceholderUrl(userId) : 'https://ui-avatars.com/api/?name=?&background=cccccc&color=ffffff&size=40', [userId]);

    if (!isAuthReady || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                 <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-xl font-black text-indigo-600">
                    Loading Point System...
                </div>
            </div>
        );
    }

    const customStyles = `
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-\[float_4s_ease-in-out_infinite\] {
            animation: float 4s ease-in-out infinite;
        }
    `;

    return (
        <div className="min-h-screen font-inter bg-gray-50">
            <style>{customStyles}</style>
            
            {/* Mentor Dashboard Header */}
            <MentorHeader 
                currentUser={currentUser}
                profilePic={profilePic}
                onProfileChange={handleProfileChange}
                onLogout={handleLogout}
                onEditProfile={() => {
                  setEditName(currentUser?.name || "");
                  setShowEditProfileModal(true);
                }}
            />

            <NotificationToast notification={notification} setNotification={setNotification} />

            {animationStudent && <WaterDropEffect effectKey={effectKey} />}

            <div className={`relative z-10 transition-all duration-300 ${selectedStudent ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                <div className="opacity-100 pointer-events-auto">
                    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
                                    {students.length}
                                </span>
                                Students Enrolled
                            </h2>
                            <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                                <span className="text-green-700 font-semibold text-sm">● Active Session</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map(student => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                    onClick={handleStudentClick}
                                    isSelected={selectedStudent && selectedStudent.id === student.id}
                                    isAnimating={isAnimating}
                                />
                            ))}
                            {students.length === 0 && (
                                <div className="col-span-full">
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Yet</h3>
                                        <p className="text-gray-500">Students will appear here once they're registered</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug: Show selected student info */}
            {selectedStudent && (
                <div className="fixed top-4 left-4 z-[10000] bg-red-500 text-white p-2 rounded text-sm">
                    Selected: {selectedStudent.name}
                </div>
            )}

            {/* Modal Overlay */}
            {selectedStudent && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-90"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            console.log('Clicked outside modal, closing');
                            setSelectedStudent(null);
                        }
                    }}
                >
                    {(() => {
                        console.log('Modal is rendering for:', selectedStudent.name);
                        return (
                            <div className="w-full max-w-3xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
                                <StudentDetail
                                    student={students.find(s => s.id === selectedStudent.id) || selectedStudent}
                                    onClose={() => {
                                        console.log('Modal close button clicked');
                                        setSelectedStudent(null);
                                    }}
                                    db={db}
                                    adminId={userId}
                                    setNotification={setNotification}
                                    setStudents={setStudents}
                                />
                            </div>
                        );
                    })()}
                </div>
            )}

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
                          <button 
                            onClick={async () => {
                              try {
                                const userRef = doc(db, 'users', currentUser.id);
                                await updateDoc(userRef, { profilePic: "" });
                                localStorage.removeItem("profilePic");
                                window.location.reload();
                              } catch (error) {
                                console.error("Error removing profile picture:", error);
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded-md"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setShowEditProfileModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                      <button
                        onClick={async () => {
                          try {
                            const updated = { ...currentUser, name: editName };
                            localStorage.setItem('currentUser', JSON.stringify(updated));
                            if (currentUser.id && db) {
                              const userRef = doc(db, 'users', currentUser.id);
                              await updateDoc(userRef, { name: editName });
                            }
                            setShowEditProfileModal(false);
                            window.location.reload();
                          } catch (err) {
                            console.error('Error saving profile changes:', err);
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
        </div>
    );
};

export default App;
