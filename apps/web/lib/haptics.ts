/**
 * Safe Web Haptics Engine for Mobile & Tablet Touchscreens
 * Wraps navigator.vibrate with graceful fallbacks for unsupported devices/browsers.
 */

class HapticsEngine {
  private isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Ultra-light click tactile feedback for UI tabs, virtual buttons, and direction taps
   */
  light(): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(10);
    } catch {}
  }

  /**
   * Medium pulse for game state shifts, pause/resume, and action button impacts
   */
  medium(): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(25);
    } catch {}
  }

  /**
   * Heavy thump for game over, crash, and hazard collision
   */
  heavy(): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(55);
    } catch {}
  }

  /**
   * Multi-burst celebration pattern for quest unlocks, tournament trophies, and high scores
   */
  celebrate(): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate([20, 35, 20, 50]);
    } catch {}
  }
}

export const haptics = new HapticsEngine();
