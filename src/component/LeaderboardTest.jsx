import React from 'react';

export default function LeaderboardTest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Leaderboard Test Page</h1>
      <p>If you can see this, then routing is working!</p>
      <p>Server time: {new Date().toLocaleString()}</p>
    </div>
  );
}