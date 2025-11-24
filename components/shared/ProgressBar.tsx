import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color = 'bg-brand-green', className = '' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={`w-full bg-brand-blue-light rounded-full h-3 overflow-hidden ${className}`}>
      <div
        className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;