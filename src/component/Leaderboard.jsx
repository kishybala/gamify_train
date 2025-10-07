import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

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
