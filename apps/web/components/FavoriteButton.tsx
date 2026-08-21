'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/profile/actions'

interface FavoriteButtonProps {
  gameId: string
  initialFavorited: boolean
}

export default function FavoriteButton({ gameId, initialFavorited }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)

  const handleToggle = () => {
    // Optimistic UI update
    setIsFavorited(!isFavorited)
    
    startTransition(async () => {
      const res = await toggleFavorite(gameId)
      if (!res.success) {
        // Revert on error
        setIsFavorited(initialFavorited)
        if (res.error === 'Not logged in') {
          alert('You must be logged in to favorite games!')
        }
      }
    })
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all text-sm font-bold w-fit shrink-0 ${isFavorited ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
    >
      <Heart size={16} className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
      {isFavorited ? 'Favorited' : 'Add to Favorites'}
    </button>
  )
}
