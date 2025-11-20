import React from 'react';

export default function Badge({ currentUser }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <h2 className="text-2xl font-bold mb-2">Badges</h2>
        <p className="text-sm text-gray-600">No badges to show for {currentUser?.name || 'user'} yet.</p>
      </div>
    </div>
  );
}
