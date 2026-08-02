import React from 'react';
import { getCapturedPieces } from '../lib/stockfishEngine';

interface CapturedPiecesProps {
  fen: string;
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛'
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ fen }) => {
  const { capturedByWhite, capturedByBlack, whiteMaterialAdvantage, blackMaterialAdvantage } =
    getCapturedPieces(fen);

  const renderPieceGroup = (captured: Record<string, number>) => {
    return (
      <div className="flex items-center gap-0.5 text-slate-800 text-xs font-bold">
        {Object.entries(captured).map(([piece, count]) => {
          if (count <= 0) return null;
          return (
            <span key={piece} className="opacity-90">
              {PIECE_SYMBOLS[piece].repeat(count)}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-1">
        <span className="text-slate-500 font-medium text-[10px]">Putih makan:</span>
        {renderPieceGroup(capturedByWhite)}
        {whiteMaterialAdvantage > 0 && (
          <span className="text-[#fe4c6f] font-mono font-extrabold text-[10px] bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
            +{whiteMaterialAdvantage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-slate-500 font-medium text-[10px]">Hitam makan:</span>
        {renderPieceGroup(capturedByBlack)}
        {blackMaterialAdvantage > 0 && (
          <span className="text-slate-700 font-mono font-extrabold text-[10px] bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
            +{blackMaterialAdvantage}
          </span>
        )}
      </div>
    </div>
  );
};
