import React from 'react';

export default function StatCard({ title, value, delta, color = '#4f46e5' }) {
  return (
    <div className="uc-statcard">
      <div className="uc-stat-left">
        <div className="uc-stat-title">{title}</div>
        <div className="uc-stat-value">{value}</div>
      </div>
      <div className="uc-stat-right" style={{ color }}>
        <div className="uc-stat-delta">{delta}</div>
      </div>
    </div>
  );
}
