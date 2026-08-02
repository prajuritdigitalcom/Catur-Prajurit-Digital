import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ArrowLeft, RotateCcw, RotateCw, Users, Trophy } from 'lucide-react';
import { ChessBoardContainer } from '../components/ChessBoardContainer';
import { CapturedPieces } from '../components/CapturedPieces';
import { GameClock } from '../components/GameClock';
import { MoveHistory } from '../components/MoveHistory';
import { TimeControl, Player, MoveRecord, BoardTheme, GameState } from '../types';
import { INITIAL_FEN } from '../constants/chess';
import { evaluateBoard } from '../lib/stockfishEngine';
import { soundEngine } from '../lib/audio';
import { saveGameToHistory } from '../lib/storage';

interface LocalPlayViewProps {
  userPlayer: Player;
  timeControl: TimeControl;
  boardTheme: BoardTheme;
  autoFlip?: boolean;
  onBack: () => void;
}

export const LocalPlayView: React.FC<LocalPlayViewProps> = ({
  userPlayer,
  timeControl,
  boardTheme,
  autoFlip = false,
  onBack
}) => {
  const [chess] = useState(() => new Chess(INITIAL_FEN));
  const [fen, setFen] = useState(INITIAL_FEN);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [orientation, setOrientation] = useState<'w' | 'b'>('w');
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<{ title: string; subtitle: string; winner?: 'w' | 'b' | 'draw' } | null>(null);

  const playerWhite: Player = {
    id: 'local-white',
    name: 'Pemain 1 (Putih)',
    avatar: '⚔️',
    rating: 1200,
    color: 'w'
  };

  const playerBlack: Player = {
    id: 'local-black',
    name: 'Pemain 2 (Hitam)',
    avatar: '🛡️',
    rating: 1200,
    color: 'b'
  };

  const [timeWhite, setTimeWhite] = useState(timeControl.minutes * 60);
  const [timeBlack, setTimeBlack] = useState(timeControl.minutes * 60);

  // Active turn timer
  useEffect(() => {
    if (isGameOver || timeControl.minutes === 0) return;

    const interval = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setTimeWhite((prev) => {
          if (prev <= 1) {
            handleTimeout('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeBlack((prev) => {
          if (prev <= 1) {
            handleTimeout('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chess, isGameOver, timeControl]);

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (isGameOver) return false;

    try {
      const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
      if (!moveResult) return false;

      const newFen = chess.fen();
      setFen(newFen);

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

      if (autoFlip) {
        setOrientation(chess.turn() === 'w' ? 'w' : 'b');
      }

      checkGameStatus();
      return true;
    } catch {
      return false;
    }
  };

  const checkGameStatus = () => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'b' : 'w';
      const winnerName = winner === 'w' ? playerWhite.name : playerBlack.name;
      finishGame(winner, 'Skakmat!', `${winnerName} memenangkan pertandingan.`);
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      finishGame('draw', 'Remis', 'Pertandingan berakhir seri.');
    }
  };

  const handleTimeout = (timedOutColor: 'w' | 'b') => {
    const winner = timedOutColor === 'w' ? 'b' : 'w';
    finishGame(winner, 'Waktu Habis!', `Waktu pemain ${timedOutColor === 'w' ? 'Putih' : 'Hitam'} habis.`);
  };

  const handleResign = () => {
    const activeColor = chess.turn();
    const winner = activeColor === 'w' ? 'b' : 'w';
    finishGame(winner, 'Menyerah', `Pemain ${activeColor === 'w' ? 'Putih' : 'Hitam'} menyerah.`);
  };

  const finishGame = (winner: 'w' | 'b' | 'draw', title: string, subtitle: string) => {
    setIsGameOver(true);
    setGameResult({ title, subtitle, winner });
    soundEngine.playGameOver();

    const gameStateRecord: GameState = {
      id: `local-game-${Date.now()}`,
      mode: 'local',
      fen: chess.fen(),
      pgn: chess.pgn(),
      history,
      currentTurn: chess.turn(),
      playerWhite,
      playerBlack,
      status: 'checkmate',
      winner,
      timeWhite,
      timeBlack,
      timeControl,
      evalScore: evaluateBoard(chess),
      createdAt: Date.now()
    };

    saveGameToHistory(gameStateRecord);
  };

  const handleReset = () => {
    chess.reset();
    setFen(INITIAL_FEN);
    setHistory([]);
    setIsGameOver(false);
    setGameResult(null);
    setOrientation('w');
    setTimeWhite(timeControl.minutes * 60);
    setTimeBlack(timeControl.minutes * 60);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 space-y-3 animate-in fade-in duration-200">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 px-3 py-2 rounded-2xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>

        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-xs text-slate-900">
            Pass & Play (Lokal)
          </span>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Black Player Clock Top */}
      <GameClock
        player={playerBlack}
        timeSeconds={timeBlack}
        isActive={chess.turn() === 'b'}
        unlimited={timeControl.minutes === 0}
      />

      {/* Chessboard */}
      <div className="w-full flex justify-center">
        <ChessBoardContainer
          chess={chess}
          orientation={orientation}
          onMove={handleMove}
          theme={boardTheme}
          disabled={isGameOver}
        />
      </div>

      {/* Captured Pieces Bar */}
      <CapturedPieces fen={fen} />

      {/* White Player Clock Bottom */}
      <GameClock
        player={playerWhite}
        timeSeconds={timeWhite}
        isActive={chess.turn() === 'w'}
        unlimited={timeControl.minutes === 0}
      />

      {/* Move History Card */}
      <MoveHistory
        history={history}
        pgn={chess.pgn()}
        fen={fen}
        onFlipBoard={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}
        onResign={handleResign}
        isGameOver={isGameOver}
      />

      {/* Game Over Modal */}
      {isGameOver && gameResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-blue-500 p-5 rounded-3xl max-w-xs w-full text-center space-y-3 shadow-xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center text-2xl border border-blue-200">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">{gameResult.title}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{gameResult.subtitle}</p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
              >
                Main Lagi
              </button>

              <button
                onClick={onBack}
                className="w-full py-1.5 text-slate-500 font-semibold text-xs"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
