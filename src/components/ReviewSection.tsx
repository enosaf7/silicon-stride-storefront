
import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/utils/types';

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  });

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId]);

  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setUserReview(prev => ({ ...prev, rating: newRating }));
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserReview(prev => ({ ...prev, comment: e.target.value }));
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }
    
    if (!userReview.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      const username = userData ? 
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
        user.email?.split('@')[0] || 'Anonymous';
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: user.id,
            username,
            product_id: productId,
            rating: userReview.rating,
            comment: userReview.comment,
            date: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Add the new review to the reviews list
      if (data && data.length > 0) {
        setReviews([data[0], ...reviews]);
      }
      
      toast.success('Review submitted successfully!');
      setUserReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-gray-500">({reviews.length} reviews)</div>
        </div>
      </div>
      
      {user && (
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h3 className="font-semibold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= userReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            value={userReview.comment}
            onChange={handleCommentChange}
            placeholder="Share your thoughts about this product..."
            rows={4}
            className="mb-4"
          />
          
          <Button
            onClick={handleSubmitReview}
            className="bg-brand-orange hover:bg-brand-orange/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}
      
      {!user && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="mb-2">Please log in to leave a review</p>
          <Button asChild variant="outline">
            <a href="/login">Log In</a>
          </Button>
        </div>
      )}
      
      {/* Reviews list */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="font-medium">{review.username}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
