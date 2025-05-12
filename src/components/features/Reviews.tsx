import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import { Star, ThumbsUp, Flag } from 'lucide-react';

interface Review {
  id: string;
  user_id: string;
  user_email: string;
  rating: number;
  comment: string;
  likes: number;
  liked_by: string[];
  created_at: string;
}

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your environment variables.');
      }

      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { error: supabaseError } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: user.id,
            user_email: user.email,
            rating: newReview.rating,
            comment: newReview.comment,
          }
        ]);

      if (supabaseError) throw supabaseError;

      setNewReview({ rating: 5, comment: '' });
      await loadReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user) return;

    try {
      setError(null);
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const hasLiked = review.liked_by.includes(user.id);
      const newLikedBy = hasLiked
        ? review.liked_by.filter(id => id !== user.id)
        : [...review.liked_by, user.id];

      const { error: supabaseError } = await supabase
        .from('reviews')
        .update({
          likes: hasLiked ? review.likes - 1 : review.likes + 1,
          liked_by: newLikedBy
        })
        .eq('id', reviewId);

      if (supabaseError) throw supabaseError;
      await loadReviews();
    } catch (err) {
      console.error('Error liking review:', err);
      setError(err instanceof Error ? err.message : 'Failed to update like status. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

        {user && (
          <Card className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Share your experience..."
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={!newReview.comment.trim()}
              >
                Submit Review
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-gray-500">Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-800 font-medium">
                          {review.user_email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {review.user_email}
                        </p>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-500"
                    title="Report review"
                  >
                    <Flag size={16} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleLikeReview(review.id)}
                    className={`flex items-center space-x-1 ${
                      user && review.liked_by.includes(user.id)
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-emerald-600'
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span>{review.likes}</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;