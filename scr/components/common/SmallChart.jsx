import React from 'react';

export default function SmallChart({ data = [4,6,5,8,7,9,6] }) {
  const max = Math.max(...data);
  const points = data.map((d,i)=>`${(i/(data.length-1))*100},${100 - (d/max)*100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="uc-smallchart">
      <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={points} />
    </svg>
  );
}
