import React from 'react';
import { Link } from "react-router-dom";
import {
  Trophy,
  Award,
  LogOut,
  Users,
  Hand,
  CheckCircle,
  Home,
  User,
  Zap,
} from 'lucide-react';

// --- TaskCard Component ---
const TaskCard = ({ task, onToggleVolunteer, currentUser }) => {
  const isFull = task.volunteersList.length >= task.required;
  const isVolunteered = task.volunteersList.includes(currentUser.id);
  const isReady = task.status === 'Ready';
  const isButtonDisabled = isReady || (isFull && !isVolunteered);

  const progressPercent = Math.min(100, (task.volunteersList.length / task.required) * 100);

  const handleClick = () => onToggleVolunteer(task.id);

  let buttonContent, buttonClasses;
  if (isReady) {
    buttonContent = "Task Ready! Waiting for council approval.";
    buttonClasses = 'bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300';
  } else if (isVolunteered) {
    buttonContent = <> <Hand className="w-5 h-5 mr-2 rotate-180" /> Lower Hand </>;
    buttonClasses = 'bg-red-500 text-white hover:bg-red-600 shadow-md';
  } else if (isFull) {
    buttonContent = <> <Users className="w-5 h-5 mr-2" /> Mission Full </>;
    buttonClasses = 'bg-gray-400 text-white cursor-not-allowed shadow-inner';
  } else {
    buttonContent = <> <Hand className="w-5 h-5 mr-2" /> Raise Hand </>;
    buttonClasses = 'bg-green-500 text-white hover:bg-green-600 shadow-md';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-extrabold text-gray-800">{task.title}</h3>
          <div className="flex space-x-2">
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{task.category}</span>
            <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ring-1 ${isReady ? 'bg-green-100 text-green-700 ring-green-300' : 'bg-blue-100 text-blue-700 ring-blue-300'}`}>
              {isReady && <CheckCircle className="w-4 h-4 mr-1" />}
              {task.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-2 text-sm">{task.desc}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Assigned To:</span> {task.assignedTo}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Points:</span> {task.points}</p>
        <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold">Deadline:</span> {task.deadline || 'N/A'}</p>

        <div className="mb-4 h-2 bg-green-200 rounded-full">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="text-xs text-gray-500 mb-5">
          <span className="font-bold text-gray-700">Volunteers:</span> {task.volunteersList.join(', ') || 'None'}
        </div>
      </div>

      {isReady ? (
        <div className="w-full text-center py-2 px-4 rounded-lg font-bold text-sm bg-indigo-100 text-indigo-700 shadow-inner border border-indigo-300">{buttonContent}</div>
      ) : (
        <button disabled={isButtonDisabled} onClick={handleClick} className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-bold text-lg ${buttonClasses}`}>
          {buttonContent}
        </button>
      )}
    </div>
  );
};

// --- Dashboard Component ---
export default function Dashboard({ tasks, setTasks, currentUser }) {

  const handleToggleVolunteer = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const isVolunteered = task.volunteersList.includes(currentUser.id);
          const updatedVolunteers = isVolunteered
            ? task.volunteersList.filter(name => name !== currentUser.id)
            : [...task.volunteersList, currentUser.id];
          return { ...task, volunteersList: updatedVolunteers };
        }
        return task;
      })
    );
  };

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      <div className="absolute inset-0 z-0 opacity-10" style={{ background: 'linear-gradient(135deg, #e0f2f1 0%, #fffde7 100%)' }}></div>
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <header className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 flex justify-between items-center">
          <div>
            <span className="text-2xl font-extrabold text-green-600 mr-4">Campus Heroes</span>
            <span className="text-xl font-bold text-gray-800">Welcome, <span className="text-green-600">{currentUser.name}</span>!</span>
            <span className="text-sm text-gray-500 ml-3">({currentUser.role})</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-md">
              <Zap className="w-5 h-5 mr-2" />
              <span>Points: 0</span>
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-full shadow-md">
              <Award className="w-5 h-5 mr-2" />
              <span>Badges: 0</span>
            </div>
            <button className="flex items-center text-gray-600 hover:text-red-500 transition duration-150 p-2 rounded-full hover:bg-gray-100">
              <LogOut className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Tabs with Router Links */}
        <nav className="flex space-x-1 bg-white p-2 rounded-xl shadow-lg mb-8 overflow-x-auto">
          <Link
            to="/dashboard"
            className="flex-shrink-0 flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" /> Dashboard
          </Link>

          <Link
            to="/badges"
            className="flex-shrink-0 flex items-center px-6 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          >
            <Award className="w-5 h-5 mr-2" /> Badges
          </Link>

          <Link
            to="/leaderboard"
            className="flex-shrink-0 flex items-center px-6 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          >
            <Trophy className="w-5 h-5 mr-2" /> Leaderboard
          </Link>

          {currentUser.role === "Council" && (
            <Link
              to="/AddTask"
              className="flex-shrink-0 flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
            >
              <User className="w-5 h-5 mr-2" /> Add Task
            </Link>
          )}
        </nav>

        {/* Content (Dashboard Task Board) */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Task Board ✏️</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggleVolunteer={handleToggleVolunteer} currentUser={currentUser} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center">No tasks yet. Council can add tasks!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
