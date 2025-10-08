import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  // Get current user to determine which dashboard to return to
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const dashboardPath = currentUser.role === "Mentor" ? "/mentor-dashboard" : "/dashboard";

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), orderBy("points", "desc"));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate(dashboardPath)}
        className="mb-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
      
      <h1 className="text-3xl font-bold text-center mb-6">🏆 Leaderboard</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6">
        {users.length > 0 ? (
          <ul>
            {users.map((user, index) => (
              <li
                key={user.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>{index + 1}. {user.name || user.email}</span>
                <span className="font-bold text-green-600">{user.points} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No users yet 🫤</p>
        )}
      </div>
    </div>
  );
}
