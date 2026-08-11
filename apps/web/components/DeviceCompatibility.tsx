import { Smartphone, Monitor, Gamepad2 } from 'lucide-react';

export default function DeviceCompatibility() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-3xl p-8 md:p-12 border border-primary/20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-outfit font-bold mb-4">Play Anywhere, Anytime</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Whether you're on a powerful desktop or a mobile device, our HTML5 games are optimized for flawless performance across all your screens.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
          <Smartphone className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Mobile Optimized</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Touch-friendly controls and responsive layouts for iOS and Android.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center transform md:-translate-y-4 border-2 border-primary">
          <Monitor className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Desktop Ready</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Full-screen glory with keyboard and mouse precision support.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
          <Gamepad2 className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Controller Support</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect your gamepad via Bluetooth for the ultimate console experience.</p>
        </div>
      </div>
    </div>
  );
}
