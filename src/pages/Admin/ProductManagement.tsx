
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductTable from '@/components/Admin/ProductTable';
import { Button } from '@/components/ui/button';
import { Plus, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddProductDialog from '@/components/Admin/AddProductDialog';
import { Product } from '@/utils/types';

const ProductManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error('Failed to load products');
        throw error;
      }
      
      return data as Product[];
    }
  });

  // Set up real-time subscription for products
  useEffect(() => {
    const channel = supabase
      .channel('admin-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };
  
  const handleProductSaved = () => {
    refetch();
    setIsAddDialogOpen(false);
    setEditingProduct(null);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Button className="bg-brand-orange hover:bg-brand-orange/90" onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <ProductTable 
            products={products || []} 
            onEdit={handleEditProduct} 
            onRefresh={refetch} 
          />
        )}
        
        <AddProductDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          product={editingProduct}
          onSaved={handleProductSaved}
        />
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;
