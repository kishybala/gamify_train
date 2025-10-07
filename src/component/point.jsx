import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';


// --- FIREBASE AND UTILITY SETUP ---
const firebaseConfig = { apiKey: "AIzaSyArwJ46ilZz3PB4hknxPz7XGEw2zF5KUXI", authDomain: "gamify-station.firebaseapp.com", projectId: "gamify-station", storageBucket: "gamify-station.firebasestorage.app", messagingSenderId: "158401998275", appId: "1:158401998275:web:1f7d3cbbcae3ff726de176", measurementId: "G-6G1HQ8J64Z", };
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// Helper function to generate a stable, colorful placeholder URL for a student name
const generatePlaceholderUrl = (name = "") => {
    // Generate a hash based on the name for a consistent background color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate a color from the hash
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hexColor = "000000".substring(0, 6 - color.length) + color;

    // Get the first two initials of the name
    const initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

    // Placeholder image URL
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
                    console.error("Firebase Auth Error:", error);
                    // Fallback to anonymous sign-in if custom token fails
                    await signInAnonymously(authentication);
                }
            };

            const unsubscribe = authentication.onAuthStateChanged(user => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // Sign in if not already authenticated
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

const useStudents = (db, isAuthReady, userId) => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !isAuthReady || !userId) return;

        const studentsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
        const studentQuery = query(studentsCollectionRef);

        const unsubscribe = onSnapshot(studentQuery, (snapshot) => {
            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                transactions: doc.data().transactions || [],
            }));

            // Sort by points descending
            studentList.sort((a, b) => b.totalPoints - a.totalPoints);

            // Add rank
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
    }, [db, isAuthReady, userId]);

    return { students, setStudents, isLoading }; // <-- expose setStudents for instant updates
};

// Custom Notification Toast Component
const NotificationToast = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000); // Notification disappears after 3 seconds
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

// --- NEW COMPONENT FOR ENHANCED WATER DROP ANIMATION ---
const WaterDropEffect = ({ effectKey }) => {
    // Styling for multiple layers of ripple (for a dramatic, attractive effect)
    const layers = useMemo(() => ([
        { size: 'w-4 h-4', delay: 0, duration: 'duration-700', color: 'bg-indigo-300' },
        { size: 'w-8 h-8', delay: 100, duration: 'duration-900', color: 'bg-purple-400' },
        { size: 'w-12 h-12', delay: 200, duration: 'duration-1000', color: 'bg-pink-500' },
    ]), []);

    useEffect(() => {
        layers.forEach((layer, index) => {
            const el = document.getElementById(`water-drop-${effectKey}-${index}`);
            if (el) {
                // Initial delay plus layer specific delay
                const initialDelay = 50 + layer.delay;

                const timeout1 = setTimeout(() => {
                    el.style.opacity = 1;
                    // Scale up aggressively for an attractive "pop"
                    el.style.transform = 'scale(40)';

                    // Fade out quickly after scaling starts
                    const timeout2 = setTimeout(() => {
                        el.style.opacity = 0;
                        el.style.transform = 'scale(50)'; // Continue scaling during fade
                    }, 300);

                    return () => clearTimeout(timeout2);
                }, initialDelay);

                return () => clearTimeout(timeout1);
            }
        });
    }, [effectKey, layers]);


    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" // Increased Z-index
        >
            {layers.map((layer, index) => (
                <div
                    key={index}
                    id={`water-drop-${effectKey}-${index}`}
                    className={`absolute ${layer.size} ${layer.color} rounded-full transition-all ${layer.duration} ease-out transform`}
                    style={{
                        opacity: 0,
                        transform: 'scale(0)',
                        // Using translateZ(0) to force hardware acceleration for smooth animation
                        willChange: 'transform, opacity',
                        boxShadow: '0 0 10px 5px rgba(120, 80, 200, 0.5)', // Added a subtle shadow/glow
                        zIndex: index // Ensure inner layers are on top of outer ones initially
                    }}
                />
            ))}
        </div>
    );
};


// --- COMPONENTS ---

const PointGiver = ({ db, student, adminId, onClose, setNotification, students, setStudents }) => {
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const pointOptions = [
        { value: 1, label: 'Teamwork', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { value: 2, label: 'Creative Solution', color: 'bg-green-600 hover:bg-green-700' },
        { value: 4, label: 'Leadership Award', color: 'bg-teal-700 hover:bg-teal-800' },
        { value: -1, label: 'Minor Deviation', color: 'bg-orange-500 hover:bg-orange-600' },
        { value: -2, label: 'Late Submission', color: 'bg-red-600 hover:bg-red-700' },
        { value: -4, label: 'Major Infraction', color: 'bg-red-700 hover:bg-red-800' },
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
            const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
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
                totalPoints: newTotalPoints,
                transactions: [...(currentData.transactions || []), newTransaction],
            }, { merge: true });

            // Instant local UI update
            setStudents(prev => prev.map(s =>
                s.id === student.id
                    ? { ...s, totalPoints: newTotalPoints, transactions: [...s.transactions, newTransaction] }
                    : s
            ));

            setNotification({ message: `${pointsToAdd} points assigned to ${student.name}!`, type: 'success' });
            setPoints(0);
            setReason('');
            onClose(); // close panel
        } catch (error) {
            console.error("Error giving points:", error);
            setNotification({ message: "Failed to assign points.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleButtonClick = (option) => {
        setReason(option.label);
        givePoints(option.value, option.label);
    };

    return (
        <div className="p-4 bg-indigo-50/70 rounded-2xl shadow-inner border border-gray-100/50">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-indigo-200 pb-2">
                Assign Points ({student.name})
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
                    className="w-1/3 p-3 border-2 border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
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

// Student Detail Panel
const StudentDetail = ({ student, onClose, db, adminId, setNotification, students, setStudents }) => {
    const pointGlow = student.totalPoints >= 50 ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]' : '';

    return (
        // Added max-h-[85vh] and overflow-y-auto to control maximum visible height
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-in-out transform border-4 border-indigo-500/50 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                {/* Translated title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{student.name}'s Profile</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="text-center mb-6">
                <p className={`text-6xl font-black transition-colors duration-300 ${pointGlow}`}
                    style={{ color: student.totalPoints >= 0 ? '#059669' : '#EF4444' }}>
                    {student.totalPoints}
                </p>
                {/* Translated label */}
                <p className="text-xl font-bold text-gray-500">Total Points</p>
            </div>

            <PointGiver
                db={db}
                student={student}           // correct student
                adminId={adminId}
                onClose={onClose}
                setNotification={setNotification}
                students={students}         // passed down from App
                setStudents={setStudents}   // passed down from App
            />
            <div className="mt-8">
                {/* Translated title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-dashed pb-2">Transaction History</h3>
                <div className="max-h-60 overflow-y-auto pr-3 bg-indigo-50/50 p-3 rounded-xl shadow-inner">
                    {student.transactions && student.transactions.length > 0 ? (
                        // Sort locally by timestamp descending before mapping
                        student.transactions.slice().sort((a, b) => b.timestamp - a.timestamp).map((t, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-b-0 py-2">
                                <span className={`font-extrabold w-16 ${t.points >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {t.points > 0 ? `+${t.points}` : t.points} Pts
                                </span>
                                <span className="text-gray-700 flex-1 ml-3 font-medium">{t.reason}</span>
                                <span className="text-gray-400 text-xs w-24 text-right">
                                    {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </span>
                            </div>
                        ))
                    ) : (
                        // Translated empty message
                        <p className="text-gray-500 text-center py-4">No point history yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Student List Card
const StudentCard = ({ student, onClick, isSelected, isAnimating }) => {
    // --- Point-based Styling ---
    let tierColor = 'bg-white border-gray-100';
    let pointColor = 'text-gray-800';
    let shadowStyle = 'shadow-lg hover:shadow-xl';

    if (student.totalPoints >= 50) {
        tierColor = 'bg-yellow-50/50 border-yellow-200'; // Gold tier
        pointColor = 'text-yellow-600 drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]';
    } else if (student.totalPoints >= 20) {
        tierColor = 'bg-indigo-50/50 border-indigo-200'; // Silver tier
        pointColor = 'text-indigo-600';
    } else if (student.totalPoints < 0) {
        tierColor = 'bg-red-50/50 border-red-200'; // Warning tier
        pointColor = 'text-red-600';
    }

    // --- Animation Classes ---
    // Added 'animate-pulse-slow' for subtle floating effect
    const baseClasses = `w-full relative p-4 rounded-2xl transition-all duration-300 border-2 ${tierColor} ${shadowStyle}`;
    const activeClasses = isSelected ? "ring-4 ring-indigo-400 scale-[1.03] shadow-2xl z-10" : "hover:scale-[1.02] cursor-pointer hover:shadow-2xl";
    const clickClasses = isAnimating ? 'pointer-events-none opacity-80' : 'cursor-pointer animate-[float_4s_ease-in-out_infinite]';

    // --- Trophy SVG for Rank 1 ---
    const TrophyIcon = () => (
        <svg className="w-6 h-6 text-yellow-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.33 3.67a.75.75 0 0 0-.58-.16l-3.33.83a.75.75 0 0 0-.58.16l-1.5.75a.75.75 0 0 0-.3.6V15h11V6.25a.75.75 0 0 0-.3-.6l-1.5-.75Zm-1.83 5.38a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 .75-.75Z" />
            <path fillRule="evenodd" d="M16 6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6ZM10 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div
            className={`${baseClasses} ${activeClasses} ${clickClasses} ${isSelected ? 'z-10' : 'z-0'}`}
            onClick={() => onClick(student)}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {/* The rank badge was correctly removed in the previous iteration. */}

                    {/* Profile Image / Placeholder Image */}
                    <img
                        src={generatePlaceholderUrl(student.name)}
                        alt={`${student.name} profile`}
                        className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                    />

                    <div className="font-bold text-gray-800 text-xl">
                        {student.name}
                    </div>
                </div>

                {/* Points Display */}
                <div className="flex items-center space-x-2">
                    {/* Rank 1 (Trophy) icon is kept to visually distinguish the leader */}
                    {student.rank === 1 && <TrophyIcon />}
                    <div className={`text-4xl font-black ${pointColor} transition-colors duration-300`}>
                        {student.totalPoints} <span className="text-base font-semibold text-gray-600 ml-1">Pts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const { db, auth, userId, isAuthReady } = useFirebase();
const { students, setStudents, isLoading } = useStudents(db, isAuthReady, userId);
    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationStudent, setAnimationStudent] = useState(null);
    const [effectKey, setEffectKey] = useState(0);

    const isAdmin = true;
    const [notification, setNotification] = useState(null);

    // Simulate initial student setup if the list is empty (for first run/demo)
    useEffect(() => {
        if (!db || !isAuthReady || !userId || isLoading || students.length > 0) return;

        const setupInitialStudents = async () => {
            const initialUsers = [
                { name: "Aarav Sharma", id: 'aarav-001' },
                { name: "Zoe Miller", id: 'zoe-002' },
                { name: "Chris Evans", id: 'chris-003' },
                { name: "Priya Singh", id: 'priya-004' },
                { name: "John Doe", id: 'john-005' },
                { name: "Emily Chen", id: 'emily-006' },
            ];

            for (const user of initialUsers) {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);
                try {
                    await setDoc(docRef, {
                        name: user.name,
                        totalPoints: Math.floor(Math.random() * 80) + 10, // Start with more dynamic points
                        transactions: [],
                    }, { merge: true });
                } catch (e) {
                    console.error("Error setting initial student:", e);
                }
            }
        };

        setupInitialStudents();
    }, [db, isAuthReady, isLoading, students.length, userId]);


    // UPDATED: Handle click to start the sequenced animation
    const handleStudentClick = useCallback((student) => {
        if (isAnimating) return;

        if (selectedStudent && selectedStudent.id === student.id) {
            setSelectedStudent(null);
            return;
        }

        // --- Start Animation Sequence (Water Drop Effect) ---
        setIsAnimating(true);
        setAnimationStudent(student);
        setEffectKey(prev => prev + 1); // Trigger water drop component key change

        // Wait 500ms for the drop effect to complete its main visual burst
        const dropTimeout = setTimeout(() => {

            // 2. Open Detail Panel 
            setSelectedStudent(student);

            // 3. End Animation Lock (after detail panel transition, ~700ms)
            const openTimeout = setTimeout(() => {
                setIsAnimating(false);
                setAnimationStudent(null);
            }, 700);

            return () => clearTimeout(openTimeout);
        }, 500);

        return () => clearTimeout(dropTimeout);

    }, [isAnimating, selectedStudent]);

    // Memoized component for the detail panel to control its animation/visibility
    const DetailPanel = useMemo(() => {
        if (!selectedStudent) return null;
        return (
            <StudentDetail
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                db={db}
                adminId={userId}
                setNotification={setNotification}
                students={students}        // pass state
                setStudents={setStudents}  // pass setter
            />


        );
    }, [selectedStudent, db, userId, setNotification]);

    if (!isAuthReady || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                {/* Translated loading text */}
                <div className="text-2xl font-black text-indigo-600 animate-bounce">Student Points Tracker Loading...</div>
            </div>
        );
    }

    // Custom CSS for the subtle float animation using keyframes
    // Injecting keyframes via style tag (best practice for single file React)
    const customStyles = `
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
    `;

    return (
        <div className="min-h-screen font-['Inter'] relative overflow-hidden p-4 sm:p-8 
            bg-gradient-to-br from-indigo-50 to-purple-50">

            {/* Custom Keyframes for float animation */}
            <style>{customStyles}</style>

            {/* Subtle background visual elements for a creative look */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 opacity-30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 opacity-20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

            <NotificationToast notification={notification} setNotification={setNotification} />

            {/* Water Drop Effect is now multi-layered and more dramatic */}
            {animationStudent && <WaterDropEffect effectKey={effectKey} />}

            <header className="mb-10 border-b-4 border-indigo-400/50 pb-4 flex justify-between items-center flex-wrap relative z-20">
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                    {/* Translated title */}
                    <span className="text-indigo-600 drop-shadow-md">Student</span> <span className="text-purple-600">Points Tracker</span>
                </h1>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-indigo-200">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black text-white text-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    {/* Translated label */}
                    <span className="font-extrabold text-gray-800 text-base">
                        Admin Panel
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Column: Student List (Opacity and pointer-events-none when modal is open) */}
                <div className={`lg:col-span-2 space-y-5 transition-opacity duration-300 
                    ${selectedStudent ? 'opacity-30 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
                >
                    {/* Translated list header */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-wider">All Students ({students.length})</h2>
                    {students.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onClick={handleStudentClick}
                            isSelected={selectedStudent && selectedStudent.id === student.id}
                            isAnimating={isAnimating} // Pass animation state to disable clicks
                        />
                    ))}
                    {/* Translated empty list message */}
                    {students.length === 0 && <p className="text-center text-gray-600 py-10 bg-white/60 rounded-xl shadow-inner">No students registered yet.</p>}
                </div>

                {/* Right Column/Overlay: Detail Panel (Full-screen top-aligned modal with high z-index) */}
                <div className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 flex justify-center pt-28 // HEADER के नीचे दिखने के लिए pt-28 किया गया
                    ${selectedStudent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Detail Panel container - max-w-md width and centered spinning animation */}
                    <div className={`w-11/12 max-w-md transition-all duration-700 ease-out // छोटे साइज़ के लिए max-w-lg से max-w-md किया गया
                        ${selectedStudent ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-180'}`}
                    >
                        {DetailPanel}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
