import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { BOARD_THEMES } from '../constants/chess';
import { BoardTheme } from '../types';
import { soundEngine } from '../lib/audio';

interface ChessBoardContainerProps {
  chess: Chess;
  orientation?: 'w' | 'b';
  onMove?: (from: string, to: string, promotion?: string) => boolean;
  theme?: BoardTheme;
  highlightLegalMoves?: boolean;
  disabled?: boolean;
}

export const ChessBoardContainer: React.FC<ChessBoardContainerProps> = ({
  chess,
  orientation = 'w',
  onMove,
  theme = 'default',
  highlightLegalMoves = true,
  disabled = false
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleSquares, setPossibleSquares] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Get active theme colors
  const activeTheme = BOARD_THEMES.find((t) => t.id === theme) || BOARD_THEMES[0];

  const getPossibleMoves = (square: Square) => {
    const moves = chess.moves({ square, verbose: true });
    return moves.map((m) => m.to as Square);
  };

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    // If a square was already selected and user clicks a possible target square
    if (selectedSquare) {
      if (possibleSquares.includes(square)) {
        // Check if move is a pawn promotion
        const piece = chess.get(selectedSquare);
        const isPawn = piece?.type === 'p';
        const isPromotionRank =
          (piece?.color === 'w' && square.endsWith('8')) ||
          (piece?.color === 'b' && square.endsWith('1'));

        if (isPawn && isPromotionRank) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleSquares([]);
        return;
      }
    }

    // Select piece on current square if it's the active turn's piece
    const pieceOnSquare = chess.get(square);
    if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
      setSelectedSquare(square);
      if (highlightLegalMoves) {
        setPossibleSquares(getPossibleMoves(square));
      }
    } else {
      setSelectedSquare(null);
      setPossibleSquares([]);
    }
  };

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (disabled) return false;

    // Check pawn promotion
    const piece = chess.get(sourceSquare);
    const isPawn = piece?.type === 'p';
    const isPromotionRank =
      (piece?.color === 'w' && targetSquare.endsWith('8')) ||
      (piece?.color === 'b' && targetSquare.endsWith('1'));

    if (isPawn && isPromotionRank) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return true; // Keep piece pending until user picks promotion
    }

    const success = executeMove(sourceSquare, targetSquare);
    setSelectedSquare(null);
    setPossibleSquares([]);
    return success;
  };

  const executeMove = (from: Square, to: Square, promotion: string = 'q'): boolean => {
    if (!onMove) return false;

    const isCapture = chess.get(to) !== null;
    const success = onMove(from, to, promotion);

    if (success) {
      if (chess.inCheck()) {
        soundEngine.playCheck();
      } else if (isCapture) {
        soundEngine.playCapture();
      } else {
        soundEngine.playMove();
      }
    }

    return success;
  };

  const handlePromotionSelect = (piece: string) => {
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setPossibleSquares([]);
    }
  };

  // Custom styles for legal moves, last move, check, & selected square
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // 1. Highlight Last Move (from & to)
  const history = chess.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: 'rgba(212, 162, 76, 0.35)',
      boxShadow: 'inset 0 0 0 2px rgba(212, 162, 76, 0.65)'
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: 'rgba(212, 162, 76, 0.55)',
      boxShadow: 'inset 0 0 0 2px rgba(212, 162, 76, 0.85)'
    };
  }

  // 2. Highlight King when in check
  if (chess.inCheck()) {
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const kingSquare = `${String.fromCharCode(97 + c)}${8 - r}`;
          customSquareStyles[kingSquare] = {
            backgroundColor: 'rgba(220, 38, 38, 0.65)',
            boxShadow: 'inset 0 0 10px rgba(239, 68, 68, 0.95)'
          };
        }
      }
    }
  }

  // 3. Highlight Selected Square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(254, 76, 111, 0.45)',
      boxShadow: 'inset 0 0 8px rgba(254, 76, 111, 0.8)'
    };
  }

  // 4. Highlight Legal Move Targets
  possibleSquares.forEach((sq) => {
    const isCaptureTarget = chess.get(sq) !== null;
    customSquareStyles[sq] = {
      background: isCaptureTarget
        ? 'radial-gradient(circle, rgba(254, 76, 111, 0.85) 40%, transparent 40%)'
        : 'radial-gradient(circle, rgba(254, 76, 111, 0.65) 25%, transparent 25%)',
      borderRadius: '50%'
    };
  });

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto select-none rounded-2xl overflow-hidden shadow-lg border-2 border-slate-300 bg-white">
      <Chessboard
        options={{
          position: chess.fen(),
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            return handlePieceDrop(sourceSquare as Square, targetSquare as Square);
          },
          onSquareClick: ({ square }) => {
            if (square) {
              handleSquareClick(square as Square);
            }
          },
          boardOrientation: orientation === 'w' ? 'white' : 'black',
          lightSquareStyle: { backgroundColor: activeTheme.lightSquare },
          darkSquareStyle: { backgroundColor: activeTheme.darkSquare },
          squareStyles: customSquareStyles,
          allowDragging: !disabled,
          animationDurationInMs: 500,
          showAnimations: true
        }}
      />

      {/* Pawn Promotion Modal Overlay */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#fe4c6f] p-4 rounded-2xl shadow-xl text-center max-w-xs w-full animate-in fade-in zoom-in-95">
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Promosi Bidak!</h4>
            <p className="text-slate-500 text-xs mb-4">Pilih bidak promosi untuk pion Anda:</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'q', label: 'Ratu', symbol: '♛' },
                { id: 'r', label: 'Benteng', symbol: '♜' },
                { id: 'b', label: 'Gajah', symbol: '♝' },
                { id: 'n', label: 'Kuda', symbol: '♞' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePromotionSelect(p.id)}
                  className="p-3 bg-slate-100 hover:bg-[#fe4c6f] hover:text-white rounded-xl text-3xl font-bold transition-all shadow-xs flex flex-col items-center gap-1 text-slate-800"
                >
                  <span>{p.symbol}</span>
                  <span className="text-[10px] font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
