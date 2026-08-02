import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { ArrowLeft, Search, Lightbulb, RotateCcw, FileText } from 'lucide-react';
import { ChessBoardContainer } from '../components/ChessBoardContainer';
import { EvaluationBar } from '../components/EvaluationBar';
import { CapturedPieces } from '../components/CapturedPieces';
import { MoveHistory } from '../components/MoveHistory';
import { BoardTheme, MoveRecord } from '../types';
import { INITIAL_FEN } from '../constants/chess';
import { evaluateBoard, getAIMove } from '../lib/stockfishEngine';

interface AnalysisViewProps {
  initialFen?: string;
  initialPgn?: string;
  boardTheme: BoardTheme;
  onBack: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  initialFen,
  initialPgn,
  boardTheme,
  onBack
}) => {
  const [chess] = useState(() => {
    const c = new Chess();
    if (initialPgn) {
      try { c.loadPgn(initialPgn); } catch { /* ignore */ }
    } else if (initialFen) {
      try { c.load(initialFen); } catch { /* ignore */ }
    }
    return c;
  });

  const [fen, setFen] = useState(chess.fen());
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [evalScore, setEvalScore] = useState(() => evaluateBoard(chess));
  const [bestMoveHint, setBestMoveHint] = useState<{ from: string; to: string; san: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputFen, setInputFen] = useState('');
  const [inputPgn, setInputPgn] = useState('');

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    try {
      const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
      if (!moveResult) return false;

      const newFen = chess.fen();
      setFen(newFen);
      setEvalScore(evaluateBoard(chess));
      setBestMoveHint(null);

      const newRecord: MoveRecord = {
        moveNumber: Math.floor(history.length / 2) + 1,
        san: moveResult.san,
        fenAfter: newFen,
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        captured: moveResult.captured
      };

      setHistory((prev) => [...prev, newRecord]);
      return true;
    } catch {
      return false;
    }
  };

  const handleCalculateBestMove = async () => {
    setIsCalculating(true);
    try {
      const best = await getAIMove(chess.fen(), 10);
      setBestMoveHint({ from: best.from, to: best.to, san: best.san });
    } catch {
      // ignore
    } finally {
      setIsCalculating(false);
    }
  };

  const handleImportFen = () => {
    if (!inputFen.trim()) return;
    try {
      chess.load(inputFen.trim());
      setFen(chess.fen());
      setEvalScore(evaluateBoard(chess));
      setHistory([]);
      setBestMoveHint(null);
      setInputFen('');
    } catch {
      alert('Format FEN tidak valid!');
    }
  };

  const handleImportPgn = () => {
    if (!inputPgn.trim()) return;
    try {
      chess.loadPgn(inputPgn.trim());
      setFen(chess.fen());
      setEvalScore(evaluateBoard(chess));
      setBestMoveHint(null);
      setInputPgn('');
    } catch {
      alert('Format PGN tidak valid!');
    }
  };

  const handleReset = () => {
    chess.reset();
    setFen(INITIAL_FEN);
    setHistory([]);
    setEvalScore(0);
    setBestMoveHint(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 space-y-3 animate-in fade-in duration-200 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 px-3 py-2 rounded-2xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>

        <div className="flex items-center gap-1.5">
          <Search className="w-4 h-4 text-purple-600" />
          <h2 className="font-extrabold text-xs text-slate-900">
            Analisis & Engine
          </h2>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Compact Evaluation Bar */}
      <EvaluationBar score={evalScore} compact />

      {/* Chessboard */}
      <div className="w-full flex justify-center">
        <ChessBoardContainer
          chess={chess}
          onMove={handleMove}
          theme={boardTheme}
        />
      </div>

      {/* Captured Pieces Bar */}
      <CapturedPieces fen={fen} />

      {/* Best Move Recommendation Display Card */}
      <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-slate-900">Rekomendasi Terbaik</span>
          </div>

          <button
            onClick={handleCalculateBestMove}
            disabled={isCalculating}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
          >
            {isCalculating ? 'Kalkulasi...' : 'Hitung Engine'}
          </button>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
          {bestMoveHint
            ? `Solusi: ${bestMoveHint.san} (${bestMoveHint.from} ➔ ${bestMoveHint.to})`
            : 'Klik tombol di atas untuk menganalisis posisi terbaik.'}
        </div>
      </div>

      {/* Move History Card */}
      <MoveHistory
        history={history}
        pgn={chess.pgn()}
        fen={fen}
      />

      {/* Import FEN / PGN Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
          <FileText className="w-4 h-4 text-[#fe4c6f]" />
          Import FEN / PGN
        </div>

        {/* Import FEN */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-black uppercase">FEN String:</label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputFen}
              onChange={(e) => setInputFen(e.target.value)}
              placeholder="Tempel FEN string..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#fe4c6f]"
            />
            <button
              onClick={handleImportFen}
              className="px-3 py-1.5 bg-[#fe4c6f] text-white rounded-xl font-bold text-xs"
            >
              Load
            </button>
          </div>
        </div>

        {/* Import PGN */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-black uppercase">PGN Notasi:</label>
          <textarea
            value={inputPgn}
            onChange={(e) => setInputPgn(e.target.value)}
            placeholder="Tempel PGN..."
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#fe4c6f]"
          />
          <button
            onClick={handleImportPgn}
            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200"
          >
            Muat Notasi PGN
          </button>
        </div>
      </div>
    </div>
  );
};
