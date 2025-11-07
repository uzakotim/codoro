import React from 'react';
export function LinkInput ({
  label, 
  name, 
  value, 
  onChange 
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {

  return (
    <label className="flex flex-col items-center text-white w-full">
      {label}
      <div className="flex items-center mt-1 justify-center space-x-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 p-2 mb-1 rounded-lg bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-blue-600 text-white placeholder:text-white w-48 text-center"
        />
      </div>
    </label>
  );
};