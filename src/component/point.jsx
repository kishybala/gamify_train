import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyArwJ46ilZz3PB4hknxPz7XGEw2zF5KUXI",
  authDomain: "gamify-station.firebaseapp.com",
  projectId: "gamify-station",
  storageBucket: "gamify-station.firebasestorage.app",
  messagingSenderId: "158401998275",
  appId: "1:158401998275:web:1f7d3cbbcae3ff726de176",
  measurementId: "G-6G1HQ8J64Z"
};

const appId = "default-app-id"; // change if needed
const initialAuthToken = null;  // or your token if using custom auth

// --- UTILITIES ---
const generatePlaceholderUrl = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  const hexColor = '000000'.substring(0, 6 - color.length) + color;
  const initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  return `https://placehold.co/40x40/${hexColor}/ffffff?text=${initials}&font=arial`;
};

// --- CUSTOM HOOK: Firebase ---
const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
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
      } catch (err) {
        console.error("Firebase authentication failed:", err);
        setAuthError(err.message);
      }
    };

    const unsubscribe = authentication.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else authenticate();
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { db, auth, userId, isAuthReady, authError };
};

// --- CUSTOM HOOK: Fetch Students ---
const useStudents = (db, isAuthReady, userId) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;

    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    const q = query(studentsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        transactions: doc.data().transactions || []
      }));
      list.sort((a, b) => b.totalPoints - a.totalPoints);
      setStudents(list.map((s, i) => ({ ...s, rank: i + 1 })));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, userId]);

  return { students, isLoading };
};

// --- COMPONENT: Student Card ---
const StudentCard = ({ student }) => {
  let tierColor = 'bg-white border-gray-100';
  let pointColor = 'text-gray-800';

  if (student.totalPoints >= 50) tierColor = 'bg-yellow-50 border-yellow-200', pointColor = 'text-yellow-600';
  else if (student.totalPoints >= 20) tierColor = 'bg-indigo-50 border-indigo-200', pointColor = 'text-indigo-600';
  else if (student.totalPoints < 0) tierColor = 'bg-red-50 border-red-200', pointColor = 'text-red-600';

  return (
    <div className={`w-full p-4 rounded-2xl border-2 ${tierColor} mb-4`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={generatePlaceholderUrl(student.name)} alt={student.name} className="w-12 h-12 rounded-full" />
          <div className="font-bold">{student.name}</div>
        </div>
        <div className={`text-xl font-black ${pointColor}`}>{student.totalPoints} Pts</div>
      </div>
    </div>
  );
};

// --- COMPONENT: Notification ---
const NotificationToast = ({ notification }) => {
  if (!notification) return null;
  const colorClasses = notification.type === 'error' ? 'bg-red-600' :
                       notification.type === 'success' ? 'bg-green-600' : 'bg-indigo-600';

  return (
    <div className={`fixed bottom-4 right-4 z-[110] p-4 rounded-xl shadow-2xl text-white font-semibold ${colorClasses}`}>
      {notification.message}
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const { db, userId, isAuthReady, authError } = useFirebase();
  const { students, isLoading } = useStudents(db, isAuthReady, userId);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (authError) {
      setNotification({ message: authError, type: 'error' });
    }
  }, [authError]);

  if (!isAuthReady) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="p-8 bg-indigo-50 min-h-screen">
      <NotificationToast notification={notification} />
      <h1 className="text-3xl font-bold mb-6">Student Points Tracker</h1>

      {!db ? (
        <div className="text-red-600 font-semibold">Database not initialized!</div>
      ) : isLoading ? (
        <div className="text-gray-800">Loading student points...</div>
      ) : (
        <div>
          {students.map((s) => <StudentCard key={s.id} student={s} />)}
        </div>
      )}
    </div>
  );
};

export default App;
