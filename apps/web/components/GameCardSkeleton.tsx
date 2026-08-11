export default function GameCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 shadow-md animate-pulse">
      {/* Aspect Ratio Container for Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-300 dark:bg-gray-700"></div>

      {/* Content Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-black/5 dark:border-white/5">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
          </div>
          <div className="w-16 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
