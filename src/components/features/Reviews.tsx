import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';

interface Review {
  id: string;
  user_email: string;
  rating: number;
  comment: string;
  likes: number;
  liked_by: string[];
  created_at: string;
}

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user || !newReview.comment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: user.id,
            user_email: user.email,
            rating: newReview.rating,
            comment: newReview.comment.trim(),
          },
        ]);

      if (error) throw error;

      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const likeReview = async (reviewId: string) => {
    if (!user) return;

    try {
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

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis clients</h1>
        <p className="text-gray-600">
          Découvrez ce que nos clients pensent de nos services
        </p>
      </div>

      {/* Formulaire d'avis */}
      {user && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Écrire un avis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              {renderStars(newReview.rating, true, (rating) =>
                setNewReview({ ...newReview, rating })
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Partagez votre expérience..."
              />
            </div>
            <Button
              onClick={submitReview}
              disabled={submitting || !newReview.comment.trim()}
              className="w-full"
            >
              {submitting ? 'Publication...' : 'Publier l\'avis'}
            </Button>
          </div>
        </Card>
      )}

      {/* Liste des avis */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun avis pour le moment
              </h3>
              <p className="text-gray-600">
                Soyez le premier à partager votre expérience !
              </p>
            </div>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {review.user_email.split('@')[0]}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.comment}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => likeReview(review.id)}
                  disabled={!user}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                    user && review.liked_by.includes(user.id)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.likes}</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}