'use client'

import { useState, useEffect, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavoriteGame } from '@/app/profile/actions'

interface FavoriteButtonProps {
  gameId: string
  initialFavorited: boolean
}

export default function FavoriteButton({ gameId, initialFavorited }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)

  // Initialize with guest favorites if available
  useEffect(() => {
    try {
      const guestFavs: string[] = JSON.parse(localStorage.getItem('spielcade_guest_favorites') || '[]')
      if (guestFavs.includes(gameId)) {
        setIsFavorited(true)
      } else {
        setIsFavorited(initialFavorited)
      }
    } catch {
      setIsFavorited(initialFavorited)
    }
  }, [gameId, initialFavorited])

  const handleToggle = () => {
    const next = !isFavorited
    setIsFavorited(next)

    // Save to guest localStorage immediately
    try {
      const guestFavs: string[] = JSON.parse(localStorage.getItem('spielcade_guest_favorites') || '[]')
      let updated: string[]
      if (next) {
        updated = Array.from(new Set([...guestFavs, gameId]))
      } else {
        updated = guestFavs.filter(id => id !== gameId)
      }
      localStorage.setItem('spielcade_guest_favorites', JSON.stringify(updated))
    } catch {}

    // Sync to Supabase server in background if gameId exists
    if (gameId) {
      startTransition(async () => {
        try {
          await toggleFavoriteGame(gameId)
        } catch (err) {
          console.warn('Background favorite sync skipped:', err)
        }
      })
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all text-sm font-bold w-fit shrink-0 ${isFavorited ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
      title={isFavorited ? 'Favorited' : 'Add to Favorites'}
    >
      <Heart size={16} className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
      {isFavorited ? 'Favorited' : 'Add to Favorites'}
    </button>
  )
}

