/**
 * Spielcade HTML5 SDK
 * Include this script in your game's index.html to communicate with the Spielcade platform.
 */
(function (global) {
  if (global.Spielcade) {
    return; // Already initialized
  }

  const Spielcade = {
    _callbacks: {},
    _msgId: 0,

    init: function () {
      global.addEventListener("message", this._handleMessage.bind(this));
      console.log("[Spielcade SDK] Initialized.");
      
      // Let the wrapper know we are ready
      this._send("INIT", {});
    },

    /**
     * Submit a final score to the leaderboard.
     */
    submitScore: function (score) {
      if (typeof score !== "number") {
        console.error("[Spielcade SDK] submitScore requires a number.");
        return;
      }
      this._send("SUBMIT_SCORE", { score: score });
    },

    /**
     * Signal that the game is over.
     */
    gameOver: function () {
      this._send("GAME_OVER", {});
    },

    /**
     * Request a rewarded ad.
     * Returns a Promise that resolves to true if the ad was watched successfully, false otherwise.
     */
    showRewardedAd: function () {
      return new Promise((resolve) => {
        const id = this._msgId++;
        this._callbacks[id] = resolve;
        this._send("SHOW_REWARDED_AD", {}, id);
      });
    },

    /**
     * Save data to the cloud (max 100KB).
     * @param {object} data - The JSON object to save.
     */
    saveData: function (data) {
      return new Promise((resolve, reject) => {
        const id = this._msgId++;
        this._callbacks[id] = { resolve, reject };
        this._send("SAVE_DATA", { data: data }, id);
      });
    },

    /**
     * Load data from the cloud.
     * @returns {Promise<object>}
     */
    loadData: function () {
      return new Promise((resolve, reject) => {
        const id = this._msgId++;
        this._callbacks[id] = { resolve, reject };
        this._send("LOAD_DATA", {}, id);
      });
    },

    _send: function (type, payload, id = null) {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(
          {
            source: "SPIELCADE_SDK",
            type: type,
            payload: payload,
            msgId: id
          },
          "*"
        );
      } else {
        console.warn("[Spielcade SDK] Not running inside an iframe. Message not sent:", type);
      }
    },

    _handleMessage: function (event) {
      const data = event.data;
      if (!data || data.source !== "SPIELCADE_WRAPPER") return;

      if (data.msgId !== undefined && this._callbacks[data.msgId]) {
        const cb = this._callbacks[data.msgId];
        
        if (data.type === "REWARDED_AD_COMPLETE") {
          cb(data.payload.success);
        } else if (data.type === "SAVE_DATA_RESPONSE") {
          if (data.payload.error) cb.reject(data.payload.error);
          else cb.resolve();
        } else if (data.type === "LOAD_DATA_RESPONSE") {
          if (data.payload.error) cb.reject(data.payload.error);
          else cb.resolve(data.payload.data);
        }
        
        delete this._callbacks[data.msgId];
      }
    }
  };

  Spielcade.init();
  global.Spielcade = Spielcade;

})(window);
