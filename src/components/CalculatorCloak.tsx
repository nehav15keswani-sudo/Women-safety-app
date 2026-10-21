import React, { useState } from 'react';

interface CalculatorCloakProps {
  onExit: () => void;
  onSecretSos: () => void;
}

export const CalculatorCloak: React.FC<CalculatorCloakProps> = ({ onExit, onSecretSos }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [tapCount, setTapCount] = useState(0);

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleEqual = () => {
    // Secret Emergency PIN check
    if (display === '911' || display === '112') {
      onSecretSos();
      onExit();
      return;
    }
    // Secret unlock pin
    if (display === '0000') {
      onExit();
      return;
    }

    try {
      const fullExp = `${equation}${display}`;
      // Basic safe evaluator for math operations
      const sanitized = fullExp.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleTitleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 3) {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between max-w-md mx-auto p-6 sm:p-8 select-none">
      {/* Top discreet bar */}
      <div className="flex items-center justify-between text-slate-500 text-xs py-2">
        <span onClick={handleTitleTap} className="cursor-pointer select-none">
          Calculator
        </span>
        <span className="text-[10px] text-slate-700">STD DEG</span>
      </div>

      {/* Calculator Display */}
      <div className="text-right py-8">
        <div className="text-slate-500 text-sm h-6 font-mono">{equation}</div>
        <div className="text-5xl font-light tracking-tight truncate font-mono text-white mt-1">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-slate-400 text-black font-semibold text-lg active:opacity-70 transition-opacity"
        >
          AC
        </button>
        <button
          onClick={() => {
            setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
          }}
          className="h-16 rounded-full bg-slate-400 text-black font-semibold text-lg active:opacity-70 transition-opacity"
        >
          +/-
        </button>
        <button
          onClick={() => {
            setDisplay((prev) => String(parseFloat(prev) / 100));
          }}
          className="h-16 rounded-full bg-slate-400 text-black font-semibold text-lg active:opacity-70 transition-opacity"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-16 rounded-full bg-amber-500 text-white font-semibold text-xl active:opacity-70 transition-opacity"
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-800 text-white font-normal text-2xl active:bg-slate-700 transition-colors"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="h-16 rounded-full bg-amber-500 text-white font-semibold text-xl active:opacity-70 transition-opacity"
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-800 text-white font-normal text-2xl active:bg-slate-700 transition-colors"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          className="h-16 rounded-full bg-amber-500 text-white font-semibold text-xl active:opacity-70 transition-opacity"
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-800 text-white font-normal text-2xl active:bg-slate-700 transition-colors"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="h-16 rounded-full bg-amber-500 text-white font-semibold text-xl active:opacity-70 transition-opacity"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-full col-span-2 bg-slate-800 text-white font-normal text-2xl pl-7 text-left active:bg-slate-700 transition-colors"
        >
          0
        </button>
        <button
          onClick={() => {
            if (!display.includes('.')) setDisplay(display + '.');
          }}
          className="h-16 rounded-full bg-slate-800 text-white font-normal text-2xl active:bg-slate-700 transition-colors"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="h-16 rounded-full bg-amber-500 text-white font-semibold text-xl active:opacity-70 transition-opacity"
        >
          =
        </button>
      </div>

      {/* Secret gesture hint for user */}
      <div className="pt-4 pb-2 text-center text-[11px] text-slate-800 hover:text-slate-500 transition-colors">
        <button onClick={onExit} className="underline">
          Exit Disguise (or type 0000= / 911=)
        </button>
      </div>
    </div>
  );
};
