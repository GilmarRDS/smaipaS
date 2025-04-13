
import React from 'react';

interface ScoreBadgeProps {
  score: number | null;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  if (score === null) {
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>;
  }

  const bgColorClass = 
    score >= 70 ? 'bg-green-100 text-green-800' : 
    score >= 60 ? 'bg-blue-100 text-blue-800' : 
    'bg-orange-100 text-orange-800';

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${bgColorClass}`}>
      {score}%
    </span>
  );
};

export default ScoreBadge;
