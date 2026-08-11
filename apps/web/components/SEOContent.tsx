import React from 'react';

export interface GameConfigSEO {
  description?: string;
  history?: string;
  strategy?: string;
  tips?: string[];
  keyboardControls?: Record<string, string>;
  touchControls?: Record<string, string>;
}

interface SEOContentProps {
  config: GameConfigSEO;
}

export default function SEOContent({ config }: SEOContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {config.description && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this game</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            {config.description}
          </p>
        </section>
      )}

      {config.history && (
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">History</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {config.history}
          </p>
        </section>
      )}

      {config.strategy && (
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Strategy</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {config.strategy}
          </p>
        </section>
      )}

      {config.tips && config.tips.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
            {config.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {(config.keyboardControls || config.touchControls) && (
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to play</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Keyboard Controls */}
            {config.keyboardControls && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Keyboard Controls</h4>
                <div className="flex flex-col gap-3">
                  {Object.entries(config.keyboardControls).map(([key, action]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{action}</span>
                      <kbd className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono font-bold shadow-sm dark:shadow-none text-gray-900 dark:text-white">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Touch Controls */}
            {config.touchControls && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Touch Controls</h4>
                <div className="flex flex-col gap-3">
                  {Object.entries(config.touchControls).map(([key, action]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{action}</span>
                      <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
