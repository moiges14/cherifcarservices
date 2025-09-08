import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface Review {
  id: string;
  user_email: string;
  rating: number;
  comment: string;
  likes: number;
  liked_by: string[];
  created_at: string;
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchReviews();
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: user.id,
          user_email: user.email,
          rating: newReview.rating,
          comment: newReview.comment,
        },
      ]);

    if (!error) {
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    }
    setLoading(false);
  };

  const likeReview = async (reviewId: string) => {
    if (!user) return;

    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const hasLiked = review.liked_by.includes(user.id);
    const newLikedBy = hasLiked
      ? review.liked_by.filter(id => id !== user.id)
      : [...review.liked_by, user.id];

    const { error } = await supabase
      .from('reviews')
      .update({
        likes: newLikedBy.length,
        liked_by: newLikedBy,
      })
      .eq('id', reviewId);

    if (!error) {
      fetchReviews();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Avis clients</h2>

      {user && (
        <Card className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Écrire un avis</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`p-1 ${
                      star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Commentaire</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Partagez votre expérience..."
                required
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Publication...' : 'Publier l\'avis'}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{review.user_email}</span>
                </div>
                <p className="text-gray-800">{review.comment}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
              <button
                onClick={() => likeReview(review.id)}
                className="flex items-center space-x-1 hover:text-blue-600"
                disabled={!user}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.likes}</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}