
import React from 'react';

interface StatusBadgeProps {
  status: 'presente' | 'ausente' | 'transferida';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'transferida') {
    return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Transferida</span>;
  } else if (status === 'presente') {
    return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>;
  } else {
    return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Ausente</span>;
  }
};

export default StatusBadge;
