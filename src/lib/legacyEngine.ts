/**
 * Legacy hand-rolled JS minimax engine (AI asli sebelum integrasi Stockfish WASM).
 * Dipakai HANYA sebagai fallback otomatis kalau WASM tidak bisa jalan di browser
 * (mis. tidak ada dukungan WebAssembly).
 */

let aiWorkerInstance: Worker | null = null;

function getAIWorker(): Worker {
  if (!aiWorkerInstance) {
    aiWorkerInstance = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url),
      { type: 'module' }
    );
  }
  return aiWorkerInstance;
}

export async function getAIMove(
  fen: string,
  depth: number = 4
): Promise<{ from: string; to: string; promotion?: string; san: string; evalScore: number }> {
  return new Promise((resolve, reject) => {
    const worker = getAIWorker();
    const TIMEOUT_MS = 8000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleMessage = (e: MessageEvent) => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      if (e.data) {
        resolve(e.data);
      } else {
        reject(new Error('AI worker returned empty response'));
      }
    };

    const handleError = (err: ErrorEvent) => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
      aiWorkerInstance = null;
      reject(err);
    };

    timeoutId = setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
      aiWorkerInstance = null;
      reject(new Error('AI move timeout (circuit breaker)'));
    }, TIMEOUT_MS);

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    worker.postMessage({ fen, depth });
  });
}
