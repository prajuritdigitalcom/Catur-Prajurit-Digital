import { Chess, Square, PieceSymbol, Color } from 'chess.js';

// Piece values for positional evaluation (in centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Simplified Piece-Square Tables
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

/**
 * Evaluate static board position in centipawns relative to White.
 * Positive = White advantage, Negative = Black advantage.
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -20000 : 20000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let totalEval = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const squareIndex = r * 8 + c;
      const flippedIndex = (7 - r) * 8 + c;

      let value = PIECE_VALUES[piece.type];

      // Add positional bonuses
      if (piece.type === 'p') {
        value += piece.color === 'w' ? PAWN_TABLE[squareIndex] : PAWN_TABLE[flippedIndex];
      } else if (piece.type === 'n') {
        value += piece.color === 'w' ? KNIGHT_TABLE[squareIndex] : KNIGHT_TABLE[flippedIndex];
      } else if (piece.type === 'b') {
        value += piece.color === 'w' ? BISHOP_TABLE[squareIndex] : BISHOP_TABLE[flippedIndex];
      } else if (piece.type === 'r') {
        value += piece.color === 'w' ? ROOK_TABLE[squareIndex] : ROOK_TABLE[flippedIndex];
      } else if (piece.type === 'q') {
        value += piece.color === 'w' ? QUEEN_TABLE[squareIndex] : QUEEN_TABLE[flippedIndex];
      }

      if (piece.color === 'w') {
        totalEval += value;
      } else {
        totalEval -= value;
      }
    }
  }

  // Small mobility bonus
  const moves = chess.moves({ verbose: true });
  const mobility = moves.length * 5;
  totalEval += chess.turn() === 'w' ? mobility : -mobility;

  return totalEval;
}

/**
 * NOTE: pemilihan gerakan sekarang ada di stockfishWasmEngine.ts (Stockfish
 * 18 WASM asli), dengan legacyEngine.ts sebagai fallback otomatis. File ini
 * cuma menyimpan evaluator statis ringan (untuk eval bar) dan helper
 * captured pieces, yang keduanya cukup ringan untuk jalan di main thread.
 */

/**
 * Calculate material difference from FEN.
 */
export function getCapturedPieces(fen: string) {
  const chess = new Chess(fen);
  const board = chess.board();

  const currentCount: Record<Color, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
  };

  const initialCount: Record<PieceSymbol, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
  };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        currentCount[piece.color][piece.type]++;
      }
    }
  }

  const capturedByWhite: Record<PieceSymbol, number> = {
    p: Math.max(0, initialCount.p - currentCount.b.p),
    n: Math.max(0, initialCount.n - currentCount.b.n),
    b: Math.max(0, initialCount.b - currentCount.b.b),
    r: Math.max(0, initialCount.r - currentCount.b.r),
    q: Math.max(0, initialCount.q - currentCount.b.q),
    k: 0
  };

  const capturedByBlack: Record<PieceSymbol, number> = {
    p: Math.max(0, initialCount.p - currentCount.w.p),
    n: Math.max(0, initialCount.n - currentCount.w.n),
    b: Math.max(0, initialCount.b - currentCount.w.b),
    r: Math.max(0, initialCount.r - currentCount.w.r),
    q: Math.max(0, initialCount.q - currentCount.w.q),
    k: 0
  };

  const whitePoints =
    capturedByWhite.p * 1 +
    capturedByWhite.n * 3 +
    capturedByWhite.b * 3 +
    capturedByWhite.r * 5 +
    capturedByWhite.q * 9;

  const blackPoints =
    capturedByBlack.p * 1 +
    capturedByBlack.n * 3 +
    capturedByBlack.b * 3 +
    capturedByBlack.r * 5 +
    capturedByBlack.q * 9;

  return {
    capturedByWhite,
    capturedByBlack,
    whiteMaterialAdvantage: Math.max(0, whitePoints - blackPoints),
    blackMaterialAdvantage: Math.max(0, blackPoints - whitePoints)
  };
}
