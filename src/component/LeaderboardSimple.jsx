import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Trophy } from 'lucide-react';

export default function LeaderboardSimple() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users...");
        const q = query(collection(db, "users"), orderBy("points", "desc"));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Users fetched:", usersList);
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            🏆 Leaderboard
          </h1>
          
          <div className="space-y-3">
            {users.length > 0 ? (
              users.map((user, index) => (
                <div 
                  key={user.id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    localStorage.setItem("selectedUserProfile", JSON.stringify(user));
                    navigate("/user-profile");
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-600">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {user.name || user.email || 'Unknown User'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {user.points || 0} pts
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}