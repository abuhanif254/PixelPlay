/**
 * Spielcade Game Developer SDK
 * 
 * Include this script in your game's index.html file:
 * <script src="https://spielcade.com/spielcade-sdk.js"></script>
 * 
 * Usage:
 * Spielcade.submitScore(1500);
 * Spielcade.unlockAchievement('first_blood');
 */

(function(window) {
  'use strict';

  // Prevent multiple initializations
  if (window.Spielcade) return;

  const SDK_VERSION = '1.0.0';

  /**
   * Dispatches a secure message to the parent window (the Spielcade platform).
   * @param {string} type - The event type
   * @param {object} payload - The event payload
   */
  function dispatchEvent(type, payload = {}) {
    // Only dispatch if the game is running inside an iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        source: 'SPIELCADE_SDK',
        version: SDK_VERSION,
        type: type,
        payload: payload
      }, '*'); // In production, we could restrict this to the exact Spielcade domain
    } else {
      console.warn(`[Spielcade SDK] Game is not running inside an iframe. Event '${type}' was ignored.`);
      console.log(`[Spielcade SDK] Payload:`, payload);
    }
  }

  window.Spielcade = {
    /**
     * Call this when the player gets a new score or finishes a run.
     * @param {number} score - The player's score
     */
    submitScore: function(score) {
      if (typeof score !== 'number' || isNaN(score)) {
        console.error('[Spielcade SDK] Invalid score submitted. Must be a valid number.');
        return;
      }
      console.log(`[Spielcade SDK] Submitting score: ${score}`);
      dispatchEvent('SUBMIT_SCORE', { score: score });
    },

    /**
     * Call this when the player unlocks a specific achievement.
     * @param {string} achievementKey - The exact string key of the achievement
     */
    unlockAchievement: function(achievementKey) {
      if (!achievementKey || typeof achievementKey !== 'string') {
        console.error('[Spielcade SDK] Invalid achievement key submitted.');
        return;
      }
      console.log(`[Spielcade SDK] Unlocking achievement: ${achievementKey}`);
      dispatchEvent('UNLOCK_ACHIEVEMENT', { key: achievementKey });
    },

    /**
     * Call this when the game is fully loaded and ready to play.
     */
    gameReady: function() {
      console.log('[Spielcade SDK] Game Ready.');
      dispatchEvent('GAME_READY');
    },

    /**
     * Call this when the game enters a "Game Over" state.
     */
    gameOver: function() {
      console.log('[Spielcade SDK] Game Over.');
      dispatchEvent('GAME_OVER');
    }
  };

  // Listen for platform virtual gamepad events dispatched from parent window
  window.addEventListener('message', function(event) {
    if (!event || !event.data) return;
    const data = event.data;
    if (
      data.type === 'SPIELCADE_GAMEPAD_EVENT' ||
      data.source === 'SPIELCADE_WRAPPER' ||
      data.source === 'SPIELCADE_VIRTUAL_PAD'
    ) {
      const eventType = data.eventType || (data.type === 'KEY_DOWN' ? 'keydown' : 'keyup');
      const key = data.key;
      const code = data.code;
      const keyCode = data.keyCode || 0;

      if (!key || !code) return;

      try {
        const evt = new KeyboardEvent(eventType, {
          key: key,
          code: code,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        Object.defineProperty(evt, 'keyCode', { get: function() { return keyCode; } });
        Object.defineProperty(evt, 'which', { get: function() { return keyCode; } });
        Object.defineProperty(evt, 'charCode', { get: function() { return eventType === 'keypress' ? keyCode : 0; } });

        window.dispatchEvent(evt);
        if (document) {
          document.dispatchEvent(evt);
          if (document.activeElement && document.activeElement !== document.body) {
            try {
              document.activeElement.dispatchEvent(evt);
            } catch (e) {}
          }
        }
      } catch (err) {}
    }
  });

  console.log(`[Spielcade SDK] Initialized (v${SDK_VERSION}).`);

})(window);
