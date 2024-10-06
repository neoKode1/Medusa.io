import React from 'react';

type ProgressProps = {
  value: number;
  max?: number;
};

export const Progress = ({ value, max = 100 }: ProgressProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  );
};
