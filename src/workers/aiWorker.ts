import { Chess, Square, PieceSymbol } from 'chess.js';

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

function evaluateBoard(chess: Chess): number {
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

  const moves = chess.moves({ verbose: true });
  const mobility = moves.length * 5;
  totalEval += chess.turn() === 'w' ? mobility : -mobility;

  return totalEval;
}

function getTimeBudget(depth: number): number {
  if (depth <= 2) return 300;
  if (depth <= 4) return 800;
  if (depth <= 7) return 2000;
  if (depth <= 12) return 4000;
  const customBudget = 4000 + (depth - 12) * 500;
  return Math.min(6000, customBudget);
}

interface BestMoveInfo {
  from: Square;
  to: Square;
  promotion?: string;
  san: string;
}

interface MinimaxResult {
  score: number;
  bestMove?: BestMoveInfo;
  aborted?: boolean;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  startTime: number,
  timeBudget: number
): MinimaxResult {
  if (Date.now() - startTime >= timeBudget) {
    return { score: evaluateBoard(chess), aborted: true };
  }

  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess) };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateBoard(chess) };
  }

  let bestMove = moves[0];

  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      if (Date.now() - startTime >= timeBudget) {
        return {
          score: maxEval === -Infinity ? evaluateBoard(chess) : maxEval,
          bestMove: { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion, san: bestMove.san },
          aborted: true
        };
      }

      chess.move(move);
      const evalResult = minimax(chess, depth - 1, alpha, beta, false, startTime, timeBudget);
      chess.undo();

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return {
      score: maxEval,
      bestMove: { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion, san: bestMove.san }
    };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      if (Date.now() - startTime >= timeBudget) {
        return {
          score: minEval === Infinity ? evaluateBoard(chess) : minEval,
          bestMove: { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion, san: bestMove.san },
          aborted: true
        };
      }

      chess.move(move);
      const evalResult = minimax(chess, depth - 1, alpha, beta, true, startTime, timeBudget);
      chess.undo();

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return {
      score: minEval,
      bestMove: { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion, san: bestMove.san }
    };
  }
}

self.onmessage = (e: MessageEvent<{ fen: string; depth: number }>) => {
  const { fen, depth } = e.data;
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  // Easy depth (1-2) random move chance
  if (depth <= 2 && Math.random() < 0.25) {
    const moves = chess.moves({ verbose: true });
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      self.postMessage({
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
        san: randomMove.san,
        evalScore: evaluateBoard(chess)
      });
      return;
    }
  }

  const startTime = Date.now();
  const timeBudget = getTimeBudget(depth);

  let bestResult: { from: string; to: string; promotion?: string; san: string; evalScore: number } | null = null;

  for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
    if (Date.now() - startTime >= timeBudget) {
      break;
    }

    const result = minimax(chess, currentDepth, -Infinity, Infinity, isWhite, startTime, timeBudget);

    if (result.bestMove) {
      bestResult = {
        from: result.bestMove.from,
        to: result.bestMove.to,
        promotion: result.bestMove.promotion,
        san: result.bestMove.san,
        evalScore: result.score
      };
    }

    if (result.aborted) {
      break;
    }
  }

  if (!bestResult) {
    const fallbackMoves = chess.moves({ verbose: true });
    if (fallbackMoves.length > 0) {
      const fallback = fallbackMoves[0];
      bestResult = {
        from: fallback.from,
        to: fallback.to,
        promotion: fallback.promotion,
        san: fallback.san,
        evalScore: evaluateBoard(chess)
      };
    }
  }

  self.postMessage(bestResult);
};
