// AddTask.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export default function AddTask({ currentUser, tasks, setTasks }) {
  const navigate = useNavigate();

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
  const [points, setPoints] = useState(10);
  const [category, setCategory] = useState("Behavior");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  // Assign to options
  const roles = ["Council", "Mentor", "Student"];

  const inputClass =
    "w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none";

  const handleSubmit = () => {
    if (!taskName || !desc || !assignedTo || !deadline) {
      setStatusMessage({
        type: "error",
        text: "Please fill all required fields including deadline!",
      });
      return;
    }

    const newTask = {
      id: Date.now(),
      title: taskName,
      desc,
      points,
      category,
      assignedTo,
      deadline,
      status: "Pending",  // ✅ Task ka initial status
      volunteersList: [],
      required: 1,
      isVolunteered: false,
      tag: category,
    };

    setTasks([newTask, ...tasks]);
    setStatusMessage({ type: "success", text: `Task "${taskName}" submitted!` });

    setTaskName("");
    setDesc("");
    setPoints(10);
    setCategory("Behavior");
    setAssignedTo("");
    setDeadline("");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 font-sans">
      <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center my-8 hover:shadow-3xl transition-all">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 flex justify-center items-center">
          Add Task{" "}
          <Zap className="ml-3 w-8 h-8 text-yellow-500 animate-bounce" />
        </h1>

        {statusMessage && (
          <div
            className={`p-4 mb-6 rounded-lg font-semibold ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="text-left">
          <label className="block text-gray-700 font-semibold mb-1">
            Task Name:
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={inputClass}
          />

          <label className="block text-gray-700 font-semibold mb-1">
            Task Description:
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="4"
            className={inputClass}
          />

          <label className="block text-gray-700 font-semibold mb-1">
            Points / XP:
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={inputClass}
            min="1"
          />

          <label className="block text-gray-700 font-semibold mb-1">
            Category / Skill:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option>Behavior</option>
            <option>Teamwork</option>
            <option>Creativity</option>
            <option>Math Skills</option>
            <option>Reading</option>
          </select>

          <label className="block text-gray-700 font-semibold mb-1">
            Assign To:
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className={inputClass}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label className="block text-gray-700 font-semibold mb-1">
            Deadline:
          </label>
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
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
            >
              Submit Task
            </button>
            <button
              onClick={() => navigate("/dashboard")}
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
