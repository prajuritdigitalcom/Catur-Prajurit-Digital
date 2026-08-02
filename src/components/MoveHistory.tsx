import React from 'react';
import { Copy, Check, RotateCw, Lightbulb, Flag, Handshake } from 'lucide-react';
import { MoveRecord } from '../types';

interface MoveHistoryProps {
  history: MoveRecord[];
  onSelectMove?: (index: number) => void;
  selectedIndex?: number;
  pgn: string;
  fen: string;
  onFlipBoard?: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  onRequestHint?: () => void;
  isGameOver?: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  onSelectMove,
  selectedIndex,
  pgn,
  fen,
  onFlipBoard,
  onResign,
  onOfferDraw,
  onRequestHint,
  isGameOver = false
}) => {
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  // Group moves into pairs (white, black)
  const pairs: { moveNum: number; white?: MoveRecord; black?: MoveRecord; whiteIdx?: number; blackIdx?: number }[] = [];

  history.forEach((rec, idx) => {
    if (idx % 2 === 0) {
      pairs.push({
        moveNum: Math.floor(idx / 2) + 1,
        white: rec,
        whiteIdx: idx
      });
    } else {
      pairs[pairs.length - 1].black = rec;
      pairs[pairs.length - 1].blackIdx = idx;
    }
  });

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(pgn || '1. e4 e5');
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl p-3 text-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
          Notasi Langkah (SAN)
        </span>
        <span className="text-[10px] font-mono font-bold text-[#fe4c6f] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {history.length} langkah
        </span>
      </div>

      {/* Move Pairs Container */}
      <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-1 max-h-[140px]">
        {pairs.length === 0 ? (
          <div className="text-center text-slate-400 py-4 text-xs italic">
            Belum ada langkah. Jalankan bidak Anda.
          </div>
        ) : (
          pairs.map((p) => (
            <div key={p.moveNum} className="grid grid-cols-7 gap-1 text-xs font-mono items-center">
              <span className="col-span-1 text-slate-400 font-bold">{p.moveNum}.</span>
              <button
                onClick={() => p.whiteIdx !== undefined && onSelectMove?.(p.whiteIdx)}
                className={`col-span-3 text-left px-2 py-1 rounded transition-colors ${
                  selectedIndex === p.whiteIdx
                    ? 'bg-[#fe4c6f] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {p.white?.san}
              </button>

              {p.black ? (
                <button
                  onClick={() => p.blackIdx !== undefined && onSelectMove?.(p.blackIdx)}
                  className={`col-span-3 text-left px-2 py-1 rounded transition-colors ${
                    selectedIndex === p.blackIdx
                      ? 'bg-[#fe4c6f] text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {p.black.san}
                </button>
              ) : (
                <span className="col-span-3"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Toolbar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          {onFlipBoard && (
            <button
              onClick={onFlipBoard}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1 border border-slate-200"
              title="Putar Papan"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {onRequestHint && !isGameOver && (
            <button
              onClick={onRequestHint}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 text-xs font-bold flex items-center gap-1"
              title="Minta Petunjuk Langkah"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Petunjuk</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyFen}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 flex items-center gap-1"
            title="Salin FEN"
          >
            {copiedFen ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>

          <button
            onClick={handleCopyPgn}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 flex items-center gap-1"
            title="Salin PGN"
          >
            {copiedPgn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>PGN</span>
          </button>
        </div>
      </div>

      {!isGameOver && (onResign || onOfferDraw) && (
        <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          {onOfferDraw && (
            <button
              onClick={onOfferDraw}
              className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Handshake className="w-3.5 h-3.5 text-slate-600" />
              Remis
            </button>
          )}
          {onResign && (
            <button
              onClick={onResign}
              className="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              Menyerah
            </button>
          )}
        </div>
      )}
    </div>
  );
};
