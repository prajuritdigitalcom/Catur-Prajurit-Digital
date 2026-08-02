import React from 'react';

interface EvaluationBarProps {
  score: number; // Centipawns relative to White (+ = White advantage, - = Black advantage)
  isMateIn?: number;
  orientation?: 'w' | 'b';
  compact?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  score,
  isMateIn,
  orientation = 'w',
  compact = false
}) => {
  let whitePercent = 50;

  if (isMateIn !== undefined) {
    whitePercent = isMateIn > 0 ? 98 : 2;
  } else {
    const evalClamped = Math.max(-1000, Math.min(1000, score));
    whitePercent = 50 + (evalClamped / 20);
    whitePercent = Math.max(5, Math.min(95, whitePercent));
  }

  const blackPercent = 100 - whitePercent;

  const displayScore =
    isMateIn !== undefined
      ? `M${Math.abs(isMateIn)}`
      : (score >= 0 ? `+${(score / 100).toFixed(1)}` : `${(score / 100).toFixed(1)}`);

  if (compact) {
    return (
      <div className="w-full bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
        <span className="font-mono font-bold text-[#fe4c6f] min-w-[45px] text-center">
          {displayScore}
        </span>
        <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300/60">
          <div
            className="bg-white transition-all duration-300"
            style={{ width: `${whitePercent}%` }}
          />
          <div
            className="bg-slate-800 transition-all duration-300"
            style={{ width: `${blackPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-6 bg-slate-200 border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between items-center select-none shadow-xs">
      <div
        className={`w-full h-full flex flex-col ${
          orientation === 'w' ? 'justify-start' : 'justify-end'
        }`}
      >
        <div
          className="bg-slate-800 transition-all duration-300 relative w-full flex items-center justify-center"
          style={{
            height: orientation === 'w' ? `${blackPercent}%` : `${whitePercent}%`
          }}
        >
          <span className="text-[9px] font-mono font-bold text-white z-10 px-0.5">
            {displayScore}
          </span>
        </div>

        <div
          className="bg-white transition-all duration-300 w-full flex-1"
          style={{
            height: orientation === 'w' ? `${whitePercent}%` : `${blackPercent}%`
          }}
        />
      </div>
    </div>
  );
};
