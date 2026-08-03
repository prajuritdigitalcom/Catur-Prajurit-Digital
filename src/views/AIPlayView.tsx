import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ArrowLeft, RotateCcw, Bot, Trophy } from 'lucide-react';
import { ChessBoardContainer } from '../components/ChessBoardContainer';
import { EvaluationBar } from '../components/EvaluationBar';
import { CapturedPieces } from '../components/CapturedPieces';
import { GameClock } from '../components/GameClock';
import { MoveHistory } from '../components/MoveHistory';
import { AILevel, TimeControl, Player, MoveRecord, BoardTheme, GameState } from '../types';
import { AI_LEVELS, INITIAL_FEN } from '../constants/chess';
import { getAIMove, evaluateBoard } from '../lib/stockfishEngine';
import { soundEngine } from '../lib/audio';
import { saveGameToHistory } from '../lib/storage';

interface AIPlayViewProps {
  userPlayer: Player;
  aiLevel: AILevel;
  userColor: 'w' | 'b';
  timeControl: TimeControl;
  boardTheme: BoardTheme;
  onBack: () => void;
}

export const AIPlayView: React.FC<AIPlayViewProps> = ({
  userPlayer,
  aiLevel,
  userColor,
  timeControl,
  boardTheme,
  onBack
}) => {
  const [chess] = useState(() => new Chess(INITIAL_FEN));
  const [fen, setFen] = useState(INITIAL_FEN);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [evalScore, setEvalScore] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<{ title: string; subtitle: string; winner?: 'w' | 'b' | 'draw' } | null>(null);

  // Timers
  const [timeWhite, setTimeWhite] = useState(timeControl.minutes * 60);
  const [timeBlack, setTimeBlack] = useState(timeControl.minutes * 60);

  const selectedAiConfig = AI_LEVELS.find((l) => l.id === aiLevel) || AI_LEVELS[1];

  const aiPlayer: Player = {
    id: 'stockfish-ai',
    name: `Stockfish (${selectedAiConfig.name})`,
    avatar: '🤖',
    rating: selectedAiConfig.elo,
    color: userColor === 'w' ? 'b' : 'w',
    isAI: true
  };

  const playerWhite = userColor === 'w' ? userPlayer : aiPlayer;
  const playerBlack = userColor === 'w' ? aiPlayer : userPlayer;

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

  // AI turn trigger
  useEffect(() => {
    if (isGameOver) return;

    const currentTurn = chess.turn();
    const isAITurn = (currentTurn === 'w' && playerWhite.isAI) || (currentTurn === 'b' && playerBlack.isAI);

    if (isAITurn && !isAiThinking) {
      setIsAiThinking(true);
      triggerAIMove();
    }
  }, [fen, isGameOver]);

  const triggerAIMove = async () => {
    try {
      // Minimum thinking delay (650ms - 900ms) so user move animation finishes smoothly,
      // the AI turn feels natural and thoughtful, and the piece movement animation is clear!
      const minThinkingTime = 650 + Math.random() * 250;
      const startTime = Date.now();

      const aiMove = await getAIMove(chess.fen(), selectedAiConfig.depth);

      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, minThinkingTime - elapsedTime);
      if (remainingDelay > 0) {
        await new Promise((res) => setTimeout(res, remainingDelay));
      }

      const moveResult = chess.move({
        from: aiMove.from,
        to: aiMove.to,
        promotion: aiMove.promotion || 'q'
      });

      if (moveResult) {
        if (chess.inCheck()) {
          soundEngine.playCheck();
        } else if (moveResult.captured) {
          soundEngine.playCapture();
        } else {
          soundEngine.playMove();
        }

        const newFen = chess.fen();
        setFen(newFen);
        const score = evaluateBoard(chess);
        setEvalScore(score);

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
        checkGameStatus();
      }
    } catch (err) {
      console.error('AI move failed or timed out, executing fallback move:', err);
      const fallbackMoves = chess.moves({ verbose: true });
      if (fallbackMoves.length > 0) {
        const randomMove = fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
        const moveResult = chess.move(randomMove);
        if (moveResult) {
          if (chess.inCheck()) {
            soundEngine.playCheck();
          } else if (moveResult.captured) {
            soundEngine.playCapture();
          } else {
            soundEngine.playMove();
          }

          const newFen = chess.fen();
          setFen(newFen);
          const score = evaluateBoard(chess);
          setEvalScore(score);

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
          checkGameStatus();
        }
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleUserMove = (from: string, to: string, promotion?: string): boolean => {
    if (isGameOver || isAiThinking) return false;

    const currentTurn = chess.turn();
    const isUserTurn = (currentTurn === 'w' && !playerWhite.isAI) || (currentTurn === 'b' && !playerBlack.isAI);
    if (!isUserTurn) return false;

    try {
      const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
      if (!moveResult) return false;

      const newFen = chess.fen();
      setFen(newFen);
      const score = evaluateBoard(chess);
      setEvalScore(score);

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
      checkGameStatus();
      return true;
    } catch {
      return false;
    }
  };

  const checkGameStatus = () => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'b' : 'w';
      const winnerName = winner === userColor ? userPlayer.name : aiPlayer.name;
      finishGame(winner, 'Skakmat!', `Selamat! ${winnerName} memenangkan pertandingan.`);
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      finishGame('draw', 'Remis', 'Pertandingan berakhir seri sesuai aturan catur.');
    }
  };

  const handleTimeout = (timedOutColor: 'w' | 'b') => {
    const winner = timedOutColor === 'w' ? 'b' : 'w';
    const winnerName = winner === userColor ? userPlayer.name : aiPlayer.name;
    finishGame(winner, 'Waktu Habis!', `Waktu habis. ${winnerName} menang!`);
  };

  const handleResign = () => {
    const winner = userColor === 'w' ? 'b' : 'w';
    finishGame(winner, 'Menyerah', `${userPlayer.name} menghentikan pertandingan.`);
  };

  const finishGame = (winner: 'w' | 'b' | 'draw', title: string, subtitle: string) => {
    setIsGameOver(true);
    setGameResult({ title, subtitle, winner });
    soundEngine.playGameOver();

    const gameStateRecord: GameState = {
      id: `ai-game-${Date.now()}`,
      mode: 'ai',
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
      evalScore,
      aiLevel,
      createdAt: Date.now()
    };

    saveGameToHistory(gameStateRecord);
  };

  const handleRematch = () => {
    chess.reset();
    setFen(INITIAL_FEN);
    setHistory([]);
    setEvalScore(0);
    setIsGameOver(false);
    setGameResult(null);
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
          <Bot className="w-4 h-4 text-[#fe4c6f]" />
          <span className="font-extrabold text-xs text-slate-900 truncate max-w-[170px]">
            vs AI ({selectedAiConfig.name})
          </span>
        </div>

        <button
          onClick={handleRematch}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Opponent Clock Top */}
      <GameClock
        player={userColor === 'w' ? aiPlayer : userPlayer}
        timeSeconds={userColor === 'w' ? timeBlack : timeWhite}
        isActive={chess.turn() === (userColor === 'w' ? 'b' : 'w')}
        unlimited={timeControl.minutes === 0}
      />

      {/* Evaluation Gauge Bar (Compact Top) */}
      <EvaluationBar score={evalScore} compact />

      {/* Chess Board */}
      <div className="w-full flex justify-center">
        <ChessBoardContainer
          chess={chess}
          orientation={userColor}
          onMove={handleUserMove}
          theme={boardTheme}
          disabled={isGameOver || isAiThinking}
        />
      </div>

      {/* Captured Pieces Bar */}
      <CapturedPieces fen={fen} />

      {/* User Clock Bottom */}
      <GameClock
        player={userColor === 'w' ? userPlayer : aiPlayer}
        timeSeconds={userColor === 'w' ? timeWhite : timeBlack}
        isActive={chess.turn() === userColor}
        unlimited={timeControl.minutes === 0}
      />

      {/* Move History Drawer Card */}
      <MoveHistory
        history={history}
        pgn={chess.pgn()}
        fen={fen}
        onResign={handleResign}
        isGameOver={isGameOver}
      />

      {/* Game Over Modal */}
      {isGameOver && gameResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#fe4c6f] p-5 rounded-3xl max-w-xs w-full text-center space-y-3 shadow-xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#fe4c6f] mx-auto flex items-center justify-center text-2xl border border-rose-200">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">{gameResult.title}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{gameResult.subtitle}</p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleRematch}
                className="w-full py-2.5 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
              >
                Main Lagi (Rematch)
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
