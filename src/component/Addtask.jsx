import React, { useState } from "react";

// Mock navigate function (assuming it's running outside a router environment)
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

// Component for adding a new task
export default function AddTask() {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState("");
  const [desc, setDesc] = useState("");
  const [statusMessage, setStatusMessage] = useState(null); // To handle success/error messages

  const handleSubmit = () => {
    if (!taskName || !desc) {
        setStatusMessage({ type: 'error', text: 'Please fill in both the task name and description.' });
        return;
    }
    
    // In a real application, this is where you would call an API or Firestore to save the task
    console.log(`Submitting Task: ${taskName}, Description: ${desc}`);
    
    // Simulate success message
    setStatusMessage({ type: 'success', text: `Task "${taskName}" submitted for review!` });
    
    // Clear form fields after submission
    setTaskName("");
    setDesc("");

    // Clear message after a few seconds
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Common input/textarea styling
  const inputClass = "w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none";
  
  return (
    // Outer Wrapper
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      {/* Task Card */}
      <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-2xl shadow-2xl text-center my-8 transition duration-300 transform hover:shadow-3xl">

        <h1 className="text-4xl font-extrabold text-blue-600 mb-8 flex items-center justify-center">
          Add Task <span className="ml-3">➕</span>
        </h1>
        
        {/* Status Message Display */}
        {statusMessage && (
            <div className={`p-4 mb-6 rounded-lg font-semibold ${
                statusMessage.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
                {statusMessage.text}
            </div>
        )}

        <div className="text-left">
          {/* Task Name Input */}
          <label htmlFor="taskName" className="block text-gray-700 font-semibold mb-1">Task Name:</label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={inputClass}
            placeholder="e.g., Organize the Physics Study Group"
          />

          {/* Task Description Textarea */}
          <label htmlFor="taskDesc" className="block text-gray-700 font-semibold mb-1">Task Description (Details & XP Justification):</label>
          <textarea
            id="taskDesc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="5"
            className={inputClass}
            placeholder="Describe the task and why it deserves XP (e.g., scope, effort, impact)."
          ></textarea>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mt-6">
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 active:scale-[0.98] transform"
                onClick={handleSubmit}
              >
                Submit Task for Approval
              </button>
              <button
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-300 active:scale-[0.98] transform"
                onClick={() => navigate("/")}
              >
                ← Back to Leaderboard
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
