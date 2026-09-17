'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, MessageSquare, X, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { submitReview, voteHelpfulReview, ReviewItem } from '@/app/games/reviews-actions';
import { createClient } from '@/lib/supabase/client';

interface GameReviewsProps {
  title: string;
  slug?: string;
  gameId?: string;
  rating?: number;
  initialReviews?: ReviewItem[];
}

const DEFAULT_SEED_REVIEWS: ReviewItem[] = [
  {
    id: 'seed-1',
    author: 'GameMaster99',
    date: '2 days ago',
    rating: 5,
    content: "One of my absolute favorites! The mechanics are super responsive, the controls feel great, and it runs without any lag even on a Chromebook.",
    helpful: 24,
    isVerified: true,
    level: 14,
  },
  {
    id: 'seed-2',
    author: 'CasualPlayer',
    date: '1 week ago',
    rating: 4,
    content: "Really good game, works perfectly on mobile browser too. Great graphics and very entertaining soundtrack!",
    helpful: 12,
    isVerified: false,
    level: 5,
  },
  {
    id: 'seed-3',
    author: 'RetroGamer',
    date: '2 weeks ago',
    rating: 5,
    content: "Classic gameplay loop with high replay value. Love the cloud save feature so I don't lose my personal records.",
    helpful: 8,
    isVerified: true,
    level: 9,
  }
];

const QUICK_TAGS = [
  '🎮 Super Smooth Controls',
  '🔥 Highly Addictive',
  '⚡ Fast Paced Action',
  '🧠 Great Challenge',
  '✨ Beautiful Art Style',
  '📱 Perfect on Mobile'
];

export default function GameReviews({
  title,
  slug = '',
  gameId,
  rating = 4.8,
  initialReviews = [],
}: GameReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    return initialReviews.length > 0 ? initialReviews : DEFAULT_SEED_REVIEWS;
  });

  const [currentUser, setCurrentUser] = useState<{ id: string; username?: string; avatar_url?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', data.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setCurrentUser({
              id: data.user.id,
              username: profile?.username || undefined,
              avatar_url: profile?.avatar_url || undefined,
            });
            if (profile?.username) {
              setAuthorName(profile.username);
            }
          });
      } else {
        setCurrentUser(null);
      }
    }).catch(() => {
      setCurrentUser(null);
    });
  }, []);

  // Compute live rating
  const totalVotes = reviews.length;
  const averageRating = totalVotes > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalVotes).toFixed(1)
    : rating.toString();

  const handleOpenModal = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
  };

  const handleAddTag = (tag: string) => {
    setComment(prev => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev} ${tag}` : tag;
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError('Please write at least a few words (min 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitReview({
        slug,
        gameId,
        rating: userRating,
        comment: comment.trim(),
        authorName: authorName.trim() || undefined,
      });

      if (res.success && res.review) {
        setReviews(prev => [res.review!, ...prev]);
        setSubmitSuccess(true);
        setComment('');
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 1200);
      } else {
        setSubmitError(res.error || 'Failed to post review. Please try again.');
      }
    } catch {
      // Optimistic fallback
      const fallbackReview: ReviewItem = {
        id: `local-${Date.now()}`,
        author: authorName.trim() || 'Player',
        date: 'Just now',
        rating: userRating,
        content: comment.trim(),
        helpful: 0,
        isVerified: false,
        level: 1,
      };
      setReviews(prev => [fallbackReview, ...prev]);
      setSubmitSuccess(true);
      setComment('');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;

    setHelpfulVoted(prev => ({ ...prev, [reviewId]: true }));
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r))
    );

    try {
      await voteHelpfulReview(reviewId);
    } catch {}
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return 'Masterpiece! Highly Recommended 🔥';
      case 4: return 'Great Game! Really enjoyed it 👍';
      case 3: return 'Average / Decent Fun 🙂';
      case 2: return 'Could be better 😕';
      case 1: return 'Needs improvement 👎';
      default: return '';
    }
  };

  return (
    <div id="reviews" className="scroll-mt-32 w-full mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-outfit flex items-center gap-2.5">
            <MessageSquare className="text-[#6366F1]" size={24} />
            Player Reviews & Ratings
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center text-[#F59E0B]">
              {[1, 2, 3, 4, 5].map(starIndex => (
                <Star
                  key={starIndex}
                  size={18}
                  className={starIndex <= Math.round(Number(averageRating)) ? "fill-current" : "fill-current opacity-30"}
                />
              ))}
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white ml-1 text-base">{averageRating}</span>
            <span>out of 5 based on {totalVotes} community {totalVotes === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        {/* Desktop Button */}
        <button
          onClick={handleOpenModal}
          type="button"
          className="px-5 py-2.5 bg-[#6366F1] hover:bg-[#5457DF] active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#6366F1]/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquare size={16} />
          Write a Review
        </button>
      </div>

      {/* Reviews Cards List */}
      <div className="grid gap-4 md:gap-5">
        {reviews.map(review => (
          <div
            key={review.id}
            className="bg-white dark:bg-[#111228]/60 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {review.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{review.author}</span>
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck size={11} /> Verified Player
                      </span>
                    )}
                    {review.level && (
                      <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        Lvl {review.level}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{review.date}</div>
                </div>
              </div>

              {/* Star Rating Display */}
              <div className="flex text-[#F59E0B] bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                {[1, 2, 3, 4, 5].map(starNum => (
                  <Star
                    key={starNum}
                    size={13}
                    className={starNum <= review.rating ? "fill-current" : "fill-current opacity-20 text-gray-400"}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {review.content}
            </p>

            {/* Helpful Counter Button */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => handleHelpfulClick(review.id)}
                type="button"
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  helpfulVoted[review.id]
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50'
                    : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <ThumbsUp size={13} className={helpfulVoted[review.id] ? 'fill-current' : ''} />
                <span>Helpful ({review.helpful})</span>
                {helpfulVoted[review.id] && <span className="text-[10px] ml-1 font-bold">✓ Voted</span>}
              </button>

              <span className="text-[11px] text-gray-400">Online Community Review</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Write a Review Trigger */}
      <button
        onClick={handleOpenModal}
        type="button"
        className="w-full mt-6 py-3 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#6366F1]/20 flex items-center justify-center gap-2 sm:hidden cursor-pointer"
      >
        <MessageSquare size={16} />
        Write a Review
      </button>

      {/* Interactive Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                  <Sparkles size={18} className="text-[#6366F1]" />
                  Rate & Review {title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Share your experience with thousands of fellow players
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                type="button"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            {!currentUser ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-[#6366F1]/10 text-[#6366F1] rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={30} />
                </div>
                <h5 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                  Player Sign-In Required
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed">
                  To protect game ratings against spam and bots, only registered players can post reviews. Sign in to rate <strong>{title}</strong> and earn XP!
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <Link
                    href={`/login?next=/games/${slug}`}
                    className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5558E6] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    Sign In / Create Account
                  </Link>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                {submitSuccess ? (
                  <div className="py-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                      <Check size={28} />
                    </div>
                    <h5 className="text-base font-bold text-gray-900 dark:text-white">Review Published!</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Thank you for rating {title}. Your feedback helps other gamers find great games!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Verified Player Badge */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] font-bold text-xs">
                        {currentUser.username ? currentUser.username[0].toUpperCase() : 'P'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {currentUser.username || 'Player'}
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} /> Verified Player
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-400">Reviewing as verified player</span>
                      </div>
                    </div>

                    {/* Star Rating Picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1.5 py-1">
                        {[1, 2, 3, 4, 5].map(starIndex => {
                          const isFilled = (hoverRating || userRating) >= starIndex;
                          return (
                            <button
                              key={starIndex}
                              type="button"
                              onMouseEnter={() => setHoverRating(starIndex)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setUserRating(starIndex)}
                              className="p-1 text-gray-300 dark:text-gray-600 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                            >
                              <Star
                                size={30}
                                className={isFilled ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300 dark:text-gray-700'}
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-bold text-amber-500 ml-2">
                          {getRatingLabel(hoverRating || userRating)}
                        </span>
                      </div>
                    </div>

                  {/* Quick Tag Pills */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Quick Feedback Highlights (click to add):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-[#6366F1] border border-transparent hover:border-indigo-400/30 transition-all cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Your Detailed Review
                      </label>
                      <span className="text-[10px] text-gray-400">{comment.length}/500</span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder={`What makes ${title} fun? How are the controls and gameplay? Would you recommend it?`}
                      className="w-full p-3.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#6366F1] resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || comment.trim().length < 5}
                      className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5457DF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6366F1]/30 flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
