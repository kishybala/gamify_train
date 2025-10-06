import React, { useState } from "react";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddTask() {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState("");
  const [desc, setDesc] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = () => {
    if (!taskName || !desc) {
        setStatusMessage({ type: 'error', text: 'Please fill in both fields!' });
        return;
    }
    console.log(`Task: ${taskName}, Desc: ${desc}`);
    setStatusMessage({ type: 'success', text: `Task "${taskName}" submitted!` });
    setTaskName(""); setDesc("");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const inputClass = "w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 font-sans">
      <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center my-8 hover:shadow-3xl transition-all">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 flex justify-center items-center">
          Add Task <Zap className="ml-3 w-8 h-8 text-yellow-500 animate-bounce"/>
        </h1>

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
          <label className="block text-gray-700 font-semibold mb-1">Task Name:</label>
          <input type="text" value={taskName} onChange={(e)=>setTaskName(e.target.value)}
            className={inputClass} placeholder="e.g., Organize Study Group" />

          <label className="block text-gray-700 font-semibold mb-1">Task Description:</label>
          <textarea value={desc} onChange={(e)=>setDesc(e.target.value)}
            rows="5" className={inputClass} placeholder="Describe task & XP justification" />

          <div className="flex flex-col space-y-3 mt-6">
            <button onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition duration-300 transform active:scale-[0.98]">
              Submit Task
            </button>
            <button onClick={()=>navigate("/")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition duration-300 transform active:scale-[0.98]">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
