// AddTask.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firebase config file

export default function AddTask({ currentUser, tasks, setTasks }) {
  const navigate = useNavigate();

  // Get current user to determine which dashboard to return to
  const dashboardPath = currentUser.role === "Mentor" ? "/mentor-dashboard" : "/dashboard";

  // Access control
  if (!(currentUser.role === "Council" || currentUser.role === "Mentor")) {
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
    required: 1,
    isVolunteered: false,
    tag: category,
    createdAt: new Date(),
  };

  try {
    await addDoc(collection(db, "tasks"), newTask);

    setTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem("dashboardTasks", JSON.stringify(updated));
      return updated;
    });

    setStatusMessage({
      type: "success",
      text: `Task "${taskName}" added successfully!`
    });

    // ✅ Reset form
    setTaskName("");
    setDesc("");
    setPoints("");
    setCategory("Behavior");
    setAssignedTo("");
    setDeadline("");
    setMemberNumber("");
    setTimeout(() => setStatusMessage(null), 4000);
  } catch (error) {
    console.error("Error adding task: ", error);
    setStatusMessage({
      type: "error",
      text: "Failed to add task. Try again!"
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 font-sans">
      <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center my-8 transition-all">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 flex justify-center items-center">
          Add Task <Zap className="ml-3 w-8 h-8 text-yellow-500 animate-bounce" />
        </h1>

        {statusMessage && (
          <div
            className={`p-4 mb-6 rounded-lg font-semibold ${statusMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
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
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              Submit Task
            </button>
            <button
              onClick={() => navigate(dashboardPath)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-2xl"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
