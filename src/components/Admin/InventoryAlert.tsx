
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/utils/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const InventoryAlert: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or('stock.lte.low_stock_threshold,stock.eq.0')
          .order('stock', { ascending: true });

        if (error) throw error;
        setLowStockProducts(data || []);
      } catch (error) {
        console.error('Error fetching low stock products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowStockProducts();

    // Set up real-time subscription
    const channel = supabase
      .channel('inventory-alerts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading || lowStockProducts.length === 0) {
    return null;
  }

  const outOfStock = lowStockProducts.filter(p => p.stock === 0);
  const lowStock = lowStockProducts.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 10));

  return (
    <div className="space-y-4">
      {outOfStock.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{outOfStock.length} products are out of stock:</strong>{' '}
            {outOfStock.slice(0, 3).map(p => p.name).join(', ')}
            {outOfStock.length > 3 && ` and ${outOfStock.length - 3} more`}.{' '}
            <Link to="/admin/products" className="underline font-medium">
              View all products
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      {lowStock.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{lowStock.length} products are running low:</strong>{' '}
            {lowStock.slice(0, 3).map(p => `${p.name} (${p.stock} left)`).join(', ')}
            {lowStock.length > 3 && ` and ${lowStock.length - 3} more`}.{' '}
            <Link to="/admin/products" className="underline font-medium">
              Restock now
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InventoryAlert;
