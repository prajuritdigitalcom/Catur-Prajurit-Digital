import { Chess } from 'chess.js';
import { AILevelConfig } from '../types';
import { getAIMove as getLegacyAIMove } from './legacyEngine';

/**
 * Real Stockfish 18 (lite, single-threaded WASM build).
 * - Tidak butuh header COOP/COEP (single-threaded), tapi tetap jauh lebih
 *   kuat dari minimax JS buatan sendiri di semua level.
 * - File-nya ada di /public/engines.
 * - Lisensi GPLv3 — lihat public/engines/COPYING-stockfish.txt.
 */

const ENGINE_JS_PATH = '/engines/stockfish-18-lite-single.js';
const INIT_TIMEOUT_MS = 15000; // load pertama harus fetch+compile wasm ~7MB
const MOVE_TIMEOUT_MS = 15000; // circuit breaker per langkah

interface EngineMoveResult {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  evalScore: number;
}

interface CandidateMove {
  multipv: number;
  uciMove: string;
  scoreCp: number;
}

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let wasmFailedPermanently = false;
let isEngineLoadingState = false;
let isEngineLoadedState = false;
let hasSentNewGame = false;

export function isEngineLoaded(): boolean {
  return isEngineLoadedState;
}

export function isEngineLoading(): boolean {
  return isEngineLoadingState;
}

export function startNewGame() {
  hasSentNewGame = false;
  if (worker && isEngineLoadedState) {
    try {
      worker.postMessage('ucinewgame');
      hasSentNewGame = true;
    } catch {
      // ignore
    }
  }
}

function detectWasmSupport(): boolean {
  try {
    if (typeof WebAssembly !== 'object') return false;
    const module = new WebAssembly.Module(
      Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
    );
    return module instanceof WebAssembly.Module;
  } catch {
    return false;
  }
}

function initEngine(): Promise<void> {
  if (wasmFailedPermanently) {
    return Promise.reject(new Error('WASM engine previously failed, using legacy fallback'));
  }

  if (readyPromise) return readyPromise;

  if (!detectWasmSupport()) {
    wasmFailedPermanently = true;
    readyPromise = Promise.reject(new Error('WebAssembly not supported in this browser'));
    return readyPromise;
  }

  isEngineLoadingState = true;

  readyPromise = new Promise((resolve, reject) => {
    try {
      const w = new Worker(ENGINE_JS_PATH);
      let uciAcked = false;

      const timeoutId = setTimeout(() => {
        w.terminate();
        worker = null;
        readyPromise = null;
        wasmFailedPermanently = true;
        isEngineLoadingState = false;
        reject(new Error('Stockfish WASM init timed out'));
      }, INIT_TIMEOUT_MS);

      w.onmessage = (e: MessageEvent<string>) => {
        const line = e.data;
        if (line === 'uciok') {
          uciAcked = true;
          w.postMessage('isready');
        } else if (line === 'readyok' && uciAcked) {
          clearTimeout(timeoutId);
          worker = w;
          isEngineLoadingState = false;
          isEngineLoadedState = true;

          // Set default MultiPV option to allow move variation across all levels
          worker.postMessage('setoption name MultiPV value 3');
          resolve();
        }
      };

      w.onerror = (err) => {
        clearTimeout(timeoutId);
        w.terminate();
        worker = null;
        readyPromise = null;
        wasmFailedPermanently = true;
        isEngineLoadingState = false;
        reject(err.error || new Error('Stockfish WASM worker error'));
      };

      w.postMessage('uci');
    } catch (err) {
      readyPromise = null;
      wasmFailedPermanently = true;
      isEngineLoadingState = false;
      reject(err as Error);
    }
  });

  return readyPromise;
}

function sendOptions(config: AILevelConfig) {
  if (!worker) return;
  worker.postMessage(`setoption name UCI_LimitStrength value ${config.limitStrength}`);
  if (config.limitStrength) {
    // Stockfish membatasi UCI_Elo minimal 1320. Untuk "easy", kekuatan lemah
    // sebenarnya datang dari Skill Level rendah + movetime pendek, bukan dari
    // UCI_Elo (yang di-clamp ke 1320).
    worker.postMessage(`setoption name UCI_Elo value ${Math.max(1320, config.elo)}`);
  }
  worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
}

/**
 * Minta gerakan dari engine asli. Otomatis fallback ke legacyEngine.ts kalau
 * WASM sama sekali tidak bisa dipakai (browser tidak didukung, fetch gagal, dst).
 */
export async function getAIMove(
  fen: string,
  config: AILevelConfig,
  aiTimeMs?: number,
  incrementMs?: number
): Promise<EngineMoveResult> {
  try {
    await initEngine();
  } catch (err) {
    console.warn('Stockfish WASM unavailable, falling back to legacy engine:', err);
    return getLegacyAIMove(fen, config.depth);
  }

  const chess = new Chess(fen);

  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('Engine worker missing after init'));
      return;
    }

    let lastScoreCp: number | null = null;
    let lastMateIn: number | null = null;
    const candidates: CandidateMove[] = [];

    const timeoutId = setTimeout(() => {
      worker?.removeEventListener('message', handleMessage);
      reject(new Error('Stockfish move timed out'));
    }, MOVE_TIMEOUT_MS);

    const handleMessage = (e: MessageEvent<string>) => {
      const line = e.data;

      // Extract MultiPV candidates & score
      if (line.startsWith('info') && line.includes(' score ')) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const multipvMatch = line.match(/multipv (\d+)/);
        const pvMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);

        if (cpMatch) {
          lastScoreCp = parseInt(cpMatch[1], 10) * (chess.turn() === 'w' ? 1 : -1);
          lastMateIn = null;
        } else if (mateMatch) {
          lastMateIn = parseInt(mateMatch[1], 10) * (chess.turn() === 'w' ? 1 : -1);
        }

        if (multipvMatch && (cpMatch || mateMatch) && pvMatch) {
          const multipv = parseInt(multipvMatch[1], 10);
          const scoreCp = cpMatch ? parseInt(cpMatch[1], 10) : (mateMatch && parseInt(mateMatch[1], 10) > 0 ? 10000 : -10000);
          const uciMove = pvMatch[1];

          const idx = candidates.findIndex((c) => c.multipv === multipv);
          if (idx >= 0) {
            candidates[idx] = { multipv, uciMove, scoreCp };
          } else {
            candidates.push({ multipv, uciMove, scoreCp });
          }
        }
        return;
      }

      if (line.startsWith('bestmove')) {
        clearTimeout(timeoutId);
        worker?.removeEventListener('message', handleMessage);

        const parts = line.split(' ');
        let bestUciMove = parts[1]; // contoh: "e2e4" atau "e7e8q"
        if (!bestUciMove || bestUciMove === '(none)') {
          reject(new Error('Engine returned no move (game likely already over)'));
          return;
        }

        // Apply controlled move variations per level to prevent repetitive openings
        if (candidates.length > 1) {
          candidates.sort((a, b) => a.multipv - b.multipv);
          const topCandidate = candidates[0];

          let varProb = 0;
          let maxCpDiff = 0;

          if (config.id === 'easy') {
            varProb = 0.20;
            maxCpDiff = 250;
          } else if (config.id === 'medium') {
            varProb = 0.10;
            maxCpDiff = 120;
          } else if (config.id === 'hard') {
            varProb = 0.04;
            maxCpDiff = 50;
          } else if (config.id === 'master') {
            varProb = 0.015;
            maxCpDiff = 20;
          } else if (config.id === 'custom') {
            varProb = 0.05;
            maxCpDiff = 100;
          }

          if (Math.random() < varProb) {
            const validAlts = candidates.filter((c) => {
              if (c.multipv === 1) return false;
              return Math.abs(c.scoreCp - topCandidate.scoreCp) <= maxCpDiff;
            });

            if (validAlts.length > 0) {
              const picked = validAlts[Math.floor(Math.random() * validAlts.length)];
              bestUciMove = picked.uciMove;
            }
          }
        }

        const from = bestUciMove.slice(0, 2);
        const to = bestUciMove.slice(2, 4);
        const promotion = bestUciMove.length > 4 ? bestUciMove.slice(4, 5) : undefined;

        try {
          const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
          if (!moveResult) {
            reject(new Error(`Engine move ${bestUciMove} was illegal on given FEN`));
            return;
          }
          const evalScore =
            lastMateIn !== null ? (lastMateIn > 0 ? 20000 : -20000) : lastScoreCp ?? 0;

          resolve({ from, to, promotion, san: moveResult.san, evalScore });
        } catch (err) {
          reject(err as Error);
        }
      }
    };

    worker.addEventListener('message', handleMessage);

    sendOptions(config);

    if (!hasSentNewGame) {
      worker.postMessage('ucinewgame');
      hasSentNewGame = true;
    }

    worker.postMessage(`position fen ${fen}`);

    // Adaptive move time management based on AI clock
    let effectiveMovetimeMs = config.movetimeMs;

    if (aiTimeMs !== undefined && aiTimeMs > 0) {
      // In timed games, ensure AI never spends more than 4% of remaining clock per move
      // When AI has less than 5 seconds left, move within 100ms max!
      const clockCapPercent = aiTimeMs < 5000 ? 0.01 : 0.04;
      const timeBudget = Math.max(50, Math.floor(aiTimeMs * clockCapPercent) + (incrementMs || 0) * 800);

      if (effectiveMovetimeMs) {
        effectiveMovetimeMs = Math.min(effectiveMovetimeMs, timeBudget);
      } else {
        effectiveMovetimeMs = timeBudget;
      }
    }

    if (effectiveMovetimeMs && effectiveMovetimeMs > 0) {
      worker.postMessage(`go movetime ${effectiveMovetimeMs}`);
    } else {
      worker.postMessage(`go depth ${config.depth}`);
    }
  });
}

export function terminateEngine() {
  worker?.postMessage('quit');
  worker?.terminate();
  worker = null;
  readyPromise = null;
  isEngineLoadingState = false;
  isEngineLoadedState = false;
}
