/**
 * Low-Spec Turbo Performance & Battery Saver Engine for Spielcade
 * Optimizes GPU/DOM workload on budget Chromebooks, tablets, and phones.
 */

type PerformanceListener = (fps: number, isTurbo: boolean) => void;

class PerformanceModeEngine {
  private isTurbo: boolean = false;
  private listeners: Set<PerformanceListener> = new Set();
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 60;
  private animId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spielcade_turbo_mode');
        this.isTurbo = saved === 'true';
        this.applyDOMState();
      } catch {}
      this.startFpsMeter();
    }
  }

  public getIsTurbo(): boolean {
    return this.isTurbo;
  }

  public getFps(): number {
    return this.currentFps;
  }

  public toggleTurbo(): boolean {
    this.isTurbo = !this.isTurbo;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('spielcade_turbo_mode', String(this.isTurbo));
        this.applyDOMState();
      } catch {}
    }
    this.notify();
    return this.isTurbo;
  }

  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    listener(this.currentFps, this.isTurbo);
    return () => this.listeners.delete(listener);
  }

  private applyDOMState() {
    if (typeof document === 'undefined') return;
    if (this.isTurbo) {
      document.documentElement.classList.add('turbo-mode');
    } else {
      document.documentElement.classList.remove('turbo-mode');
    }
  }

  private startFpsMeter() {
    const loop = (now: number) => {
      this.frameCount++;
      const delta = now - this.lastFrameTime;

      if (delta >= 500) {
        this.currentFps = Math.min(60, Math.round((this.frameCount * 1000) / delta));
        this.frameCount = 0;
        this.lastFrameTime = now;
        this.notify();
      }

      this.animId = requestAnimationFrame(loop);
    };

    if (typeof window !== 'undefined') {
      this.animId = requestAnimationFrame(loop);
    }
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentFps, this.isTurbo));
  }
}

export const performanceEngine = new PerformanceModeEngine();
