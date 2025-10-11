import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

// --- GLOBAL VARIABLES (Mandatory) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;

// Helper function to generate a stable, colorful placeholder URL for a user name/ID
const generatePlaceholderUrl = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate a unique hex color from the hash
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hexColor = "000000".substring(0, 6 - color.length) + color;
    
    // Use initials for display text, or just a generic "U" if name is short/empty
    let initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    if (initials.length === 0) {
        initials = 'U';
    } else if (initials.length > 2) {
         initials = initials.substring(0, 2);
    }

    return `https://placehold.co/40x40/${hexColor}/ffffff?text=${initials}&font=arial`;
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
                .map(doc => ({ id: doc.id, ...doc.data(), transactions: doc.data().transactions || [] }));

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
        { value: 4, label: 'Leadership Award', color: 'bg-yellow-600 hover:bg-yellow-700' },
        { value: 2, label: 'Take Section (+2)', color: 'bg-green-600 hover:bg-green-700' },
        { value: 1, label: 'Peer Learning (+1)', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { value: -1, label: 'Minor Deviation (-1)', color: 'bg-orange-500 hover:bg-orange-600' },
        { value: -2, label: 'Late Submission (-2)', color: 'bg-red-600 hover:bg-red-700' },
    ];

    const givePoints = async (p, r) => {
        if (!db || !student || isSaving) return;

        setIsSaving(true);
        const pointsToAdd = p || points;
        const newReason = r || reason.trim();

        if (pointsToAdd === 0 || newReason.length === 0) {
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
                const updatedList = prev.map(s =>
                    s.id === student.id
                        ? { ...s, totalPoints: newTotalPoints, transactions: [...(s.transactions || []), newTransaction] }
                        : s
                );
                // Re-sort the list immediately
                updatedList.sort((a, b) => b.totalPoints - a.totalPoints);
                return updatedList;
            });


            setNotification({ message: `${pointsToAdd} points assigned to ${student.name}!`, type: 'success' });
            setPoints(0);
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
        setReason(option.label.split('(')[0].trim()); // Clean up reason for display
        givePoints(option.value, option.label.split('(')[0].trim());
    };

    return (
        <div className="p-4 bg-indigo-50/70 rounded-2xl shadow-inner border border-gray-100/50">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-indigo-200 pb-2">
                Assign Points
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
                {pointOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => handleButtonClick(option)}
                        disabled={isSaving}
                        className={`text-white text-xs sm:text-sm font-semibold py-3 px-2 rounded-xl transition duration-150 transform hover:scale-[1.05] disabled:opacity-50 shadow-md ${option.color}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="flex space-x-2 mb-2">
                <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    placeholder="Custom Points (+/-)"
                    className="w-1/3 p-3 border-2 border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-lg text-center"
                />
                <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Custom Reason"
                    className="w-2/3 p-3 border-2 border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <button
                onClick={() => givePoints(points, reason)}
                disabled={isSaving || points === 0 || reason.trim().length === 0}
                className="w-full mt-4 py-3 bg-indigo-600 text-white font-black rounded-xl transition duration-200 hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
            >
                {isSaving ? 'Processing...' : `Submit (${points} Points)`}
            </button>
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
const StudentDetail = ({ student, onClose, db, adminId, setNotification, setStudents }) => {
    const isNegative = student.totalPoints < 0;
    const pointColorClass = isNegative ? 'text-red-500' : 'text-green-600';
    const pointGlow = !isNegative && student.totalPoints >= 50 ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]' : '';

    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-in-out transform border-4 border-indigo-500/50 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{student.name}'s Profile</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="text-center mb-6">
                 {/* Student Profile Image Display (Uses profileImageUrl from updated student data) */}
                <img
                    src={student.profileImageUrl || generatePlaceholderUrl(student.name)}
                    alt={`${student.name} profile`}
                    className="w-20 h-20 object-cover rounded-full mx-auto mb-3 ring-4 ring-indigo-300 shadow-xl"
                    onError={(e) => { e.target.onerror = null; e.target.src = generatePlaceholderUrl(student.name); }}
                />

                <p className={`text-6xl font-black transition-colors duration-300 ${pointColorClass} ${pointGlow}`}>
                    {student.totalPoints}
                </p>
                <p className="text-xl font-bold text-gray-500">Total Points</p>
            </div>

            {/* Pass setStudents to ImageSetter for instant card update */}
            <ImageSetter 
                db={db} 
                student={student} 
                setNotification={setNotification} 
                setStudents={setStudents} 
            />

            <PointGiver
                db={db}
                student={student}
                adminId={adminId}
                onClose={onClose}
                setNotification={setNotification}
                setStudents={setStudents}
            />

            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-dashed pb-2">Transaction History</h3>
                <div className="max-h-60 overflow-y-auto pr-3 bg-indigo-50/50 p-3 rounded-xl shadow-inner">
                    {student.transactions && student.transactions.length > 0 ? (
                        student.transactions.slice().sort((a, b) => b.timestamp - a.timestamp).map((t, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-b-0 py-2">
                                <span className={`font-extrabold w-16 text-right ${t.points >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {t.points > 0 ? `+${t.points}` : t.points} Points
                                </span>
                                <span className="text-gray-700 flex-1 ml-3 font-medium">{t.reason}</span>
                                <span className="text-gray-400 text-xs w-24 text-right">
                                    {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No point history yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Student List Card - HEIGHT INCREASED to h-64
const StudentCard = ({ student, onClick, isSelected, isAnimating }) => {
    let tierColor = 'border-indigo-300';
    let pointColor = 'text-gray-800';
    let ringColor = 'ring-indigo-300';
    
    // Style based on score
    if (student.totalPoints >= 50) {
        tierColor = 'border-yellow-400';
        pointColor = 'text-yellow-600 drop-shadow-[0_0_2px_rgba(253,224,71,0.5)]';
        ringColor = 'ring-yellow-400';
    } else if (student.totalPoints < 0) {
        tierColor = 'border-red-500';
        pointColor = 'text-red-600';
        ringColor = 'ring-red-500';
    }

    // *** CHANGES HERE: Increased height to h-64 and padding to p-6 ***
    const baseClasses = `relative w-full p-6 h-64 transition-all duration-300 border-2 ${tierColor} shadow-lg bg-white rounded-xl`;
    const activeClasses = isSelected ? "ring-4 ring-indigo-500/70 scale-[1.05] shadow-2xl z-10" : "hover:scale-[1.03] cursor-pointer hover:shadow-xl";
    const clickClasses = isAnimating ? 'pointer-events-none opacity-80' : 'cursor-pointer animate-[float_4s_ease-in-out_infinite]';

    return (
        <div
            className={`${baseClasses} ${activeClasses} ${clickClasses} flex flex-col items-center justify-center text-center`}
            onClick={() => onClick(student)}
        >
            {/* Profile Image with Ring - Made image slightly larger w-12 h-12 */}
            <div className="relative mb-2">
                <img
                    // Uses the saved profileImageUrl or the placeholder
                    src={student.profileImageUrl || generatePlaceholderUrl(student.name)}
                    alt={`${student.name} profile`}
                    className={`w-12 h-12 object-cover rounded-full transition duration-300 ring-2 ${ringColor} shadow-md`}
                    // Fallback to placeholder if the saved URL is invalid
                    onError={(e) => { e.target.onerror = null; e.target.src = generatePlaceholderUrl(student.name); }}
                />
            </div>

            {/* Points Display (The dominant number) - Increased size to text-6xl */}
            <div className="mt-2 leading-none">
                <span className={`text-5xl sm:text-6xl font-black ${pointColor} transition-colors duration-300`}>
                    {student.totalPoints}
                </span>
                <span className="text-sm font-semibold text-gray-500 ml-0.5">Points</span>
            </div>

            {/* Student Name (Only name, no email) */}
            <div className="font-extrabold text-base text-gray-900 tracking-tight truncate max-w-full mt-2">
                {student.name}
            </div>
            
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const { db, userId, isAuthReady } = useFirebase();
    const [notification, setNotification] = useState(null); // Define notification state here
    
    // Pass setNotification to useStudents
    const { students, setStudents, isLoading } = useStudents(db, isAuthReady, setNotification);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationStudent, setAnimationStudent] = useState(null);
    const [effectKey, setEffectKey] = useState(0);

    // Handle click to start the sequenced animation
    const handleStudentClick = useCallback((student) => {
        if (isAnimating) return;

        if (selectedStudent && selectedStudent.id === student.id) {
            setSelectedStudent(null);
            return;
        }

        setIsAnimating(true);
        setAnimationStudent(student);
        setEffectKey(prev => prev + 1);

        // Sequence animation: 500ms for drop, then open panel, then disable animation
        const dropTimeout = setTimeout(() => {
            setSelectedStudent(student);
            const openTimeout = setTimeout(() => {
                setIsAnimating(false);
                setAnimationStudent(null);
            }, 700);
            return () => clearTimeout(openTimeout);
        }, 500);

        return () => clearTimeout(dropTimeout);
    }, [isAnimating, selectedStudent]);

    // Memoize the detail panel to avoid unnecessary re-renders
    const DetailPanel = useMemo(() => {
        if (!selectedStudent) return null;
        // Find the currently updated version of the student from the main list
        const updatedStudent = students.find(s => s.id === selectedStudent.id) || selectedStudent;
        return (
            <StudentDetail
                student={updatedStudent}
                onClose={() => setSelectedStudent(null)}
                db={db}
                adminId={userId}
                setNotification={setNotification}
                setStudents={setStudents} // Pass setStudents down
            />
        );
    }, [selectedStudent, students, db, userId, setNotification, setStudents]);

    // Generate Admin's profile details
    const adminPlaceholderUrl = useMemo(() => userId ? generatePlaceholderUrl(userId) : 'https://placehold.co/40x40/ccc/fff?text=?', [userId]);

    if (!isAuthReady || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                 <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-xl font-black text-indigo-600">
                    Loading Leaderboard...
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
        <div className="min-h-screen font-['Inter'] relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
            <style>{customStyles}</style>
            {/* Background elements for visual appeal */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 opacity-30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 opacity-20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

            <NotificationToast notification={notification} setNotification={setNotification} />

            {animationStudent && <WaterDropEffect effectKey={effectKey} />}

            <header className="mb-10 border-b-4 border-indigo-400/50 pb-4 flex justify-between items-start flex-wrap relative z-20">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                    <span className="text-indigo-600 drop-shadow-md">Admin</span> <span className="text-purple-600">Points Center</span>
                </h1>
                
                {/* --- ADMIN PROFILE DISPLAY (Top Corner) --- */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-indigo-200 self-center">
                    <img
                        src={adminPlaceholderUrl}
                        alt="Admin profile"
                        className="w-10 h-10 object-cover rounded-full ring-2 ring-indigo-500 shadow-md"
                    />
                    <div className="flex flex-col justify-center">
                        <span className="font-extrabold text-gray-800 text-base">Administrator</span>
                        {/* User ID is intentionally omitted for a cleaner look as per the user's request */}
                    </div>
                </div>
                {/* ------------------------------------------- */}

            </header>

            <div className="grid grid-cols-1 relative z-10">
                <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 transition-opacity duration-300 ${selectedStudent ? 'opacity-30 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-wider col-span-full">Student Profiles ({students.length})</h2>
                    {students.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onClick={handleStudentClick}
                            isSelected={selectedStudent && selectedStudent.id === student.id}
                            isAnimating={isAnimating}
                        />
                    ))}
                    {students.length === 0 && <p className="text-center text-gray-600 py-10 bg-white/60 rounded-xl shadow-inner col-span-full">No students registered yet. Try creating a student profile first!</p>}
                </div>

                {/* Modal Overlay for Detail Panel */}
                <div className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 flex justify-center pt-10 sm:pt-20 ${selectedStudent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className={`w-11/12 max-w-lg transition-all duration-700 ease-out ${selectedStudent ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-1'}`}>
                        {DetailPanel}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
