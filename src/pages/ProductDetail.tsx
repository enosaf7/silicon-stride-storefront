
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Star, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import ReviewSection from '@/components/ReviewSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProduct(data);
          setSelectedSize(null);
          setSelectedColor(null);
          setQuantity(1);
          setCurrentImage(0);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg">Loading product...</h1>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      await addToCart(
        product.id,
        quantity,
        selectedSize,
        selectedColor || undefined
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={product.images[currentImage]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image: string, index: number) => (
                    <div 
                      key={index}
                      className={`aspect-square bg-gray-100 rounded cursor-pointer ${
                        currentImage === index ? 'ring-2 ring-brand-orange' : ''
                      }`}
                      onClick={() => setCurrentImage(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Product Info & Actions */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {product.rating} ({Math.floor(Math.random() * 100) + 1} reviews)
                  </span>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {product.discount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        ${(product.price - (product.price * product.discount / 100)).toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                        {product.discount}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                  )}
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{product.description}</p>
                </div>
                
                <Separator className="my-6" />
                
                {/* Size Selection */}
                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Size <span className="text-red-500">*</span></h2>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: number) => (
                      <button
                        key={size}
                        className={`px-4 py-2 border rounded-md ${
                          selectedSize === size 
                            ? 'bg-brand-orange text-white border-brand-orange' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Color Selection (if available) */}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-semibold mb-2">Color <span className="text-red-500">*</span></h2>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color 
                              ? 'ring-2 ring-brand-orange ring-offset-2' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Color: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="px-3 py-2 border-r border-gray-300"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      className="px-3 py-2 border-l border-gray-300"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="bg-brand-orange hover:bg-brand-orange/90 flex-1 gap-2"
                    disabled={isAddingToCart || product.stock <= 0}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
                
                {/* Stock Status */}
                <div className={`mt-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 
                    ? `In Stock (${product.stock} available)` 
                    : 'Out of Stock'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <ReviewSection productId={product.id} />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
