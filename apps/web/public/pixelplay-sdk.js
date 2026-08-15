/**
 * PixelPlay Game Developer SDK
 * 
 * Include this script in your game's index.html file:
 * <script src="https://pixelplay.com/pixelplay-sdk.js"></script>
 * 
 * Usage:
 * PixelPlay.submitScore(1500);
 * PixelPlay.unlockAchievement('first_blood');
 */

(function(window) {
  'use strict';

  // Prevent multiple initializations
  if (window.PixelPlay) return;

  const SDK_VERSION = '1.0.0';

  /**
   * Dispatches a secure message to the parent window (the PixelPlay platform).
   * @param {string} type - The event type
   * @param {object} payload - The event payload
   */
  function dispatchEvent(type, payload = {}) {
    // Only dispatch if the game is running inside an iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        source: 'PIXELPLAY_SDK',
        version: SDK_VERSION,
        type: type,
        payload: payload
      }, '*'); // In production, we could restrict this to the exact PixelPlay domain
    } else {
      console.warn(`[PixelPlay SDK] Game is not running inside an iframe. Event '${type}' was ignored.`);
      console.log(`[PixelPlay SDK] Payload:`, payload);
    }
  }

  window.PixelPlay = {
    /**
     * Call this when the player gets a new score or finishes a run.
     * @param {number} score - The player's score
     */
    submitScore: function(score) {
      if (typeof score !== 'number' || isNaN(score)) {
        console.error('[PixelPlay SDK] Invalid score submitted. Must be a valid number.');
        return;
      }
      console.log(`[PixelPlay SDK] Submitting score: ${score}`);
      dispatchEvent('SUBMIT_SCORE', { score: score });
    },

    /**
     * Call this when the player unlocks a specific achievement.
     * @param {string} achievementKey - The exact string key of the achievement
     */
    unlockAchievement: function(achievementKey) {
      if (!achievementKey || typeof achievementKey !== 'string') {
        console.error('[PixelPlay SDK] Invalid achievement key submitted.');
        return;
      }
      console.log(`[PixelPlay SDK] Unlocking achievement: ${achievementKey}`);
      dispatchEvent('UNLOCK_ACHIEVEMENT', { key: achievementKey });
    },

    /**
     * Call this when the game is fully loaded and ready to play.
     */
    gameReady: function() {
      console.log('[PixelPlay SDK] Game Ready.');
      dispatchEvent('GAME_READY');
    },

    /**
     * Call this when the game enters a "Game Over" state.
     */
    gameOver: function() {
      console.log('[PixelPlay SDK] Game Over.');
      dispatchEvent('GAME_OVER');
    }
  };

  console.log(`[PixelPlay SDK] Initialized (v${SDK_VERSION}).`);

})(window);
