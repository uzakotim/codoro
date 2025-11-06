import React from 'react';
export function DurationInput ({
  label, 
  name, 
  value, 
  onChange 
}: { 
  label: string; 
  name: string; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleStep = (direction: 'up' | 'down') => {
    const input = inputRef.current;
    if (!input) return;
    
    direction === 'up' ? input.stepUp() : input.stepDown();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <label className="flex flex-col items-center text-white w-full">
      {label}
      <div className="flex items-center mt-1 justify-center space-x-2">
        <input
          ref={inputRef}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 p-2 mb-1 rounded-lg bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-blue-600 text-white placeholder:text-white w-24 text-center"
          min="1"
        />
        <div className='flex flex-col justify-center items-center'>
          <button
            type="button"
            aria-label={`Increase ${label}`}
            className="w-5 h-5 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => handleStep('up')}
          >
            +
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            className="w-5 h-5 mt-1 border border-1 border-blue-600 text-xs text-white rounded-md hover:border-blue-700 focus:outline-none"
            onClick={() => handleStep('down')}
          >
            -
          </button>
        </div>
      </div>
    </label>
  );
};