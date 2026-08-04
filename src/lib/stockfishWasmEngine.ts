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

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;

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
  if (readyPromise) return readyPromise;

  if (!detectWasmSupport()) {
    readyPromise = Promise.reject(new Error('WebAssembly not supported in this browser'));
    return readyPromise;
  }

  readyPromise = new Promise((resolve, reject) => {
    try {
      const w = new Worker(ENGINE_JS_PATH);
      let uciAcked = false;

      const timeoutId = setTimeout(() => {
        w.terminate();
        worker = null;
        readyPromise = null;
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
          resolve();
        }
      };

      w.onerror = (err) => {
        clearTimeout(timeoutId);
        w.terminate();
        worker = null;
        readyPromise = null;
        reject(err.error || new Error('Stockfish WASM worker error'));
      };

      w.postMessage('uci');
    } catch (err) {
      readyPromise = null;
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
export async function getAIMove(fen: string, config: AILevelConfig): Promise<EngineMoveResult> {
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

    const timeoutId = setTimeout(() => {
      worker?.removeEventListener('message', handleMessage);
      reject(new Error('Stockfish move timed out'));
    }, MOVE_TIMEOUT_MS);

    const handleMessage = (e: MessageEvent<string>) => {
      const line = e.data;

      if (line.startsWith('info') && line.includes(' score ')) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        if (cpMatch) {
          lastScoreCp = parseInt(cpMatch[1], 10) * (chess.turn() === 'w' ? 1 : -1);
          lastMateIn = null;
        } else if (mateMatch) {
          lastMateIn = parseInt(mateMatch[1], 10) * (chess.turn() === 'w' ? 1 : -1);
        }
        return;
      }

      if (line.startsWith('bestmove')) {
        clearTimeout(timeoutId);
        worker?.removeEventListener('message', handleMessage);

        const parts = line.split(' ');
        const uciMove = parts[1]; // contoh: "e2e4" atau "e7e8q"
        if (!uciMove || uciMove === '(none)') {
          reject(new Error('Engine returned no move (game likely already over)'));
          return;
        }

        const from = uciMove.slice(0, 2);
        const to = uciMove.slice(2, 4);
        const promotion = uciMove.length > 4 ? uciMove.slice(4, 5) : undefined;

        try {
          const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
          if (!moveResult) {
            reject(new Error(`Engine move ${uciMove} was illegal on given FEN`));
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
    worker.postMessage('ucinewgame');
    worker.postMessage(`position fen ${fen}`);

    if (config.movetimeMs) {
      worker.postMessage(`go movetime ${config.movetimeMs}`);
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
}
