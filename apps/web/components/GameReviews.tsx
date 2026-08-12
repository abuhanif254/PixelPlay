import React from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface GameReviewsProps {
  title: string;
  rating?: number;
}

export default function GameReviews({ title, rating = 4.6 }: GameReviewsProps) {
  // Mock reviews for SEO / UI demonstration
  const reviews = [
    {
      id: 1,
      author: "GameMaster99",
      date: "2 days ago",
      rating: 5,
      content: `I've been playing ${title} for weeks now. The mechanics are super smooth and it's highly addictive. Definitely recommend to anyone who likes these types of games!`,
      helpful: 24,
    },
    {
      id: 2,
      author: "CasualPlayer",
      date: "1 week ago",
      rating: 4,
      content: "Really good game, works perfectly on my mobile browser. Wish there was a global leaderboard though.",
      helpful: 12,
    },
    {
      id: 3,
      author: "PuzzleFanatic",
      date: "2 weeks ago",
      rating: 5,
      content: "Classic gameplay. The dark mode implementation is very nice on the eyes for late night gaming sessions.",
      helpful: 8,
    }
  ];

  return (
    <div id="reviews" className="scroll-mt-32 w-full mt-12 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white font-outfit">Player Reviews</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <div className="flex items-center text-[#F59E0B]">
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current opacity-50" />
            </div>
            <span className="font-bold text-white ml-1">{rating}</span> out of 5 based on 2,304 votes
          </div>
        </div>
        <button className="px-4 py-2 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#6366F1]/20 hidden sm:flex items-center gap-2">
          <MessageSquare size={16} />
          Write a Review
        </button>
      </div>

      <div className="grid gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-[#111228]/50 border border-white/5 rounded-2xl p-5 hover:bg-[#111228] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#1D1B4B] flex items-center justify-center font-bold text-white">
                  {review.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{review.author}</div>
                  <div className="text-xs text-gray-500">{review.date}</div>
                </div>
              </div>
              <div className="flex text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < review.rating ? "fill-current" : "fill-current opacity-20 text-gray-500"} 
                  />
                ))}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {review.content}
            </p>
            
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6366F1] transition-colors font-medium">
              <ThumbsUp size={14} />
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-bold rounded-xl transition-colors sm:hidden">
        Write a Review
      </button>
    </div>
  );
}
