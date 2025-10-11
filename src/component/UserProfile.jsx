import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Award, LogOut, Home, User as UserIcon, Zap, ArrowLeft, Calendar, Mail, MapPin, Star, Users, Lightbulb, Crown, Activity } from 'lucide-react';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function UserProfile() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || { role: "Guest", id: null, name: "Guest" }
  );
  const navigate = useNavigate();

  // Calculate category-wise points from transactions
  const calculateCategoryPoints = (transactions = []) => {
    const categories = {
      'Teamwork': { points: 0, count: 0, icon: Users, color: 'emerald' },
      'Creative Solution': { points: 0, count: 0, icon: Lightbulb, color: 'green' },
      'Leadership Award': { points: 0, count: 0, icon: Crown, color: 'teal' },
      'Minor Deviation': { points: 0, count: 0, icon: Star, color: 'orange' },
      'Late Submission': { points: 0, count: 0, icon: Star, color: 'red' },
      'Major Infraction': { points: 0, count: 0, icon: Star, color: 'red' }
    };

    transactions.forEach(transaction => {
      if (transaction.reason && categories[transaction.reason]) {
        categories[transaction.reason].points += transaction.points;
        categories[transaction.reason].count += 1;
      }
    });

    return categories;
  };

  useEffect(() => {
    // Get selected user data from localStorage
    const userData = localStorage.getItem("selectedUserProfile");
    if (userData) {
      try {
        setSelectedUser(JSON.parse(userData));
        return;
      } catch (e) {
        console.warn('Failed to parse selectedUserProfile from localStorage', e);
      }
    }

    // Fallback: if there's a current user id stored, try to fetch from Firestore
    const current = JSON.parse(localStorage.getItem("currentUser")) || currentUserData;
    if (current && current.id) {
      const fetchUserById = async () => {
        try {
          const userRef = doc(db, "users", current.id);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setSelectedUser({ id: snap.id, ...snap.data() });
            return;
          }
        } catch (err) {
          console.error('Error fetching user by id fallback:', err);
        }
        // If fallback fetch failed, redirect to leaderboard
        navigate("/leaderboard");
      };

      fetchUserById();
      return;
    }

    // If nothing is available, go back to leaderboard
    navigate("/leaderboard");
  }, [navigate]);

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      {/* Header with Back Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate("/leaderboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Leaderboard</span>
          </button>
          
          <div className="text-2xl font-bold text-gray-800">
            User Profile
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Profile Picture */}
              <div className="relative">
                <img 
                  src={selectedUser.profilePic || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {selectedUser.name || selectedUser.email?.split('@')[0] || 'Unknown User'}
                </h1>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {selectedUser.role && (
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedUser.role === 'Council' ? 'bg-red-200 text-red-800' :
                      selectedUser.role === 'Mentor' ? 'bg-green-200 text-green-800' : 
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  )}
                  {selectedUser.department && (
                    <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                      {selectedUser.department}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Points Display */}
              <div className="text-center">
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold mb-1">
                    {selectedUser.points || 0}
                  </div>
                  <div className="text-sm opacity-90">Total Points</div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
                
                {selectedUser.email && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Email</div>
                      <div className="text-gray-600">{selectedUser.email}</div>
                    </div>
                  </div>
                )}
                
                {selectedUser.location && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Location</div>
                      <div className="text-gray-600">{selectedUser.location}</div>
                    </div>
                  </div>
                )}
                
                {selectedUser.joinedDate && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Joined Date</div>
                      <div className="text-gray-600">{selectedUser.joinedDate}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Stats & Achievements */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Stats & Achievements</h2>
                
                {/* Points Summary */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Points Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Points</span>
                      <span className="font-bold text-xl text-orange-600">{selectedUser.points || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Transactions</span>
                      <span className="font-semibold text-gray-800">{selectedUser.transactions?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Category-wise Points Breakdown */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Points by Category</h3>
                  </div>
                  
                  <div className="grid gap-3">
                    {Object.entries(calculateCategoryPoints(selectedUser.transactions || [])).map(([category, data]) => {
                      const IconComponent = data.icon;
                      if (data.points === 0) return null; // Don't show categories with 0 points
                      
                      return (
                        <div key={category} className={`flex items-center justify-between p-3 bg-${data.color}-100 rounded-lg`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${data.color}-200 rounded-lg`}>
                              <IconComponent className={`w-4 h-4 text-${data.color}-600`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{category}</div>
                              <div className="text-xs text-gray-600">{data.count} time{data.count !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          <div className={`font-bold text-${data.color}-700`}>
                            {data.points > 0 ? '+' : ''}{data.points}
                          </div>
                        </div>
                      );
                    })}
                    
                    {Object.values(calculateCategoryPoints(selectedUser.transactions || [])).every(data => data.points === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No point transactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Ranking Info */}
                                {/* Recent Transactions */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                      [...selectedUser.transactions]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10)
                        .map((transaction, index) => {
                          const categoryData = calculateCategoryPoints([transaction]);
                          const category = Object.keys(categoryData).find(key => categoryData[key].points !== 0) || 'Other';
                          const categoryInfo = categoryData[category] || { color: 'gray', icon: Activity };
                          const IconComponent = categoryInfo.icon;
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                              <div className={`p-2 bg-${categoryInfo.color}-100 rounded-full`}>
                                <IconComponent className={`w-3 h-3 text-${categoryInfo.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">
                                  {transaction.reason || category}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className={`font-bold text-${categoryInfo.color}-700`}>
                                {transaction.points > 0 ? '+' : ''}{transaction.points}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No transactions found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Bio Section */}
            {selectedUser.bio && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedUser.bio}</p>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link 
                to="/leaderboard" 
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </Link>
              
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}