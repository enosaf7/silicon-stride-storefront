
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/utils/types';
import ProductCard from './ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProductRecommendationsProps {
  title?: string;
  limit?: number;
  excludeProductId?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  title = 'Recommended for You',
  limit = 8,
  excludeProductId,
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase.rpc('get_product_recommendations', {
          target_user_id: user?.id || null,
          limit_count: limit + (excludeProductId ? 1 : 0), // Get extra if we need to exclude one
        });

        if (error) throw error;

        let filteredData = data || [];
        
        // Filter out the excluded product if specified
        if (excludeProductId) {
          filteredData = filteredData.filter((p: any) => p.id !== excludeProductId);
        }

        // Limit to requested number
        filteredData = filteredData.slice(0, limit);

        setRecommendations(filteredData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, limit, excludeProductId]);

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
