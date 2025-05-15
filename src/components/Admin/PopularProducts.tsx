
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCedi } from '@/lib/utils';

interface PopularProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  order_count: number;
}

const PopularProducts: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-popular-products'],
    queryFn: async () => {
      // Since we don't have a specific RPC function for popular products,
      // we'll query the products directly and sort them
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, rating')
        .order('rating', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Add a mock order count since we don't have that data
      return data.map(product => ({
        ...product,
        order_count: Math.floor(Math.random() * 100) // Mock order count
      })) as PopularProduct[];
    }
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Popular Products</CardTitle>
        <Button 
          variant="link" 
          className="text-brand-orange"
          onClick={() => navigate('/admin/products')}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : products?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No products found</div>
        ) : (
          <div className="space-y-4">
            {products?.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < Math.floor(product.rating || 0) ? (
                            <span className="text-yellow-400">★</span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {product.order_count} orders
                    </span>
                  </div>
                </div>
                <p className="font-bold">{formatCedi(product.price)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularProducts;
