// AddTask.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firebase config file

export default function AddTask({ currentUser, tasks, setTasks }) {
  const navigate = useNavigate();

  // Get actual current user from localStorage to ensure correct role
  const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const actualUser = currentUser || storedUser;
  
  // Debug log to check user role
  console.log("AddTask - User Role:", actualUser.role);
  console.log("AddTask - Full User:", actualUser);

  // Get current user to determine which dashboard to return to - ensure mentor goes to mentor dashboard
  const dashboardPath = actualUser.role === "Mentor" ? "/mentor-dashboard" : "/dashboard";

  // Access control
  if (!(actualUser.role === "Council" || actualUser.role === "Mentor")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">
        You do not have access to add tasks.
      </div>
    );
  }

  const [taskName, setTaskName] = useState("");
  const [desc, setDesc] = useState("");
  const [points, setPoints] = useState();
  const [category, setCategory] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  const inputClass =
    "w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none";

const handleSubmit = async () => {
  if (!taskName || !desc || !assignedTo || !deadline || !memberNumber) {
    setStatusMessage({
      type: "error",
      text: "Please fill all required fields including member number and deadline!",
    });
    return;
  }

  const newTask = {
    title: taskName,
    desc,
    points: Number(points),
    category,
    assignedTo,
    deadline,
    memberNumber,
    status: "Pending",
    volunteersList: [],
    required: Number(memberNumber) || 1,
    isVolunteered: false,
    tag: category,
    createdAt: new Date(),
  };

  try {
    const docRef = await addDoc(collection(db, "tasks"), newTask);

    const newTaskWithId = { ...newTask, id: docRef.id };

    setTasks(prev => {
      const updated = [...prev, newTaskWithId];
      localStorage.setItem("dashboardTasks", JSON.stringify(updated));
      return updated;
    });

    // ✅ Show success popup
    setStatusMessage({
      type: "success",
      text: `🎉 Congratulations! Task "${taskName}" has been created successfully and assigned to ${assignedTo} department!`
    });

    // ✅ Reset form
    setTaskName("");
    setDesc("");
    setPoints("");
    setCategory("Behavior");
    setAssignedTo("");
    setDeadline("");
    setMemberNumber("");
    
    // Show success message briefly then redirect to mentor dashboard
    setTimeout(() => {
      setStatusMessage(null);
      navigate("/mentor-dashboard");
    }, 2000); // Redirect after 2 seconds
  } catch (error) {
    console.error("Error adding task: ", error);
    setStatusMessage({
      type: "error",
      text: "❌ Failed to add task. Please try again!"
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 font-sans">
      <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-3xl shadow-2xl text-center my-8 transition-all transform hover:scale-102 border border-gray-100">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2 flex justify-center items-center">
            ✨ Create New Task <Zap className="ml-3 w-8 h-8 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-gray-600 text-sm">Design amazing tasks for your team</p>
        </div>

        {statusMessage && (
          <div
            className={`p-4 mb-6 rounded-xl font-semibold text-center shadow-lg transform transition-all duration-300 ${
              statusMessage.type === "success"
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 animate-pulse"
                : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="text-left">
          <label className="block text-gray-700 font-semibold mb-1">Task Name:</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={inputClass}
          />

          <label className="block text-gray-700 font-semibold mb-1">Task Description:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="4"
            className={inputClass}
          />

          <label className="block text-gray-700 font-semibold mb-1">Points / XP:</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={inputClass}
            min="1"
          />

          <label className="block text-gray-700 font-semibold mb-1">Member:</label>
          <input
            type="number"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            className={inputClass}
            placeholder="Enter member number"
            min="1"
          />

          <label className="block text-gray-700 font-semibold mb-1">Assign Department:</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className={inputClass}
          >
            <option value="">--Choose Department--</option>
            <option value="Academic">Academic</option>
            <option value="Culture">Culture</option>
          </select>

          <label className="block text-gray-700 font-semibold mb-1">Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
            min={new Date().toISOString().split("T")[0]}
          />

          <div className="flex flex-col space-y-3 mt-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              🚀 Create Task
            </button>
            <button
              onClick={() => navigate("/mentor-dashboard")}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
            >
              ← Back to Mentor Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
