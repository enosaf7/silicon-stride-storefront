
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { getProductById, getProductReviews } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Minus, Plus, Check, Star as StarIcon } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const reviews = getProductReviews(id || '');
  
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedColor(product.colors[0]);
    }
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [product]);
  
  if (!product) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/products">
              <Button>Return to Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    // In a real app, this would dispatch to a cart context/reducer
    toast.success(`Added ${quantity} ${product.name} to your cart!`);
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast.error('Maximum available quantity selected');
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  return (
    <>
      <NavBar />
      <main className="pt-8 pb-16 bg-white">
        <div className="container mx-auto">
          <div className="mb-8">
            <Link to="/products" className="text-brand-orange hover:underline flex items-center">
              ← Back to Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === image ? 'border-brand-orange' : 'border-transparent'}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-brand-orange text-brand-orange" />
                    <span className="ml-1 mr-2 font-medium">{getAverageRating()}</span>
                  </div>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>
              
              {/* Price */}
              <div>
                {product.discount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold text-brand-orange">
                      ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="bg-brand-orange text-white text-sm px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-semibold">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-medium mb-2">Colors</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-brand-orange' : ''}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium">Size</h3>
                  <Link to="/size-guide" className="text-sm text-brand-orange hover:underline">
                    Size Guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-4 py-2 rounded-md border text-center min-w-[3rem]
                        ${selectedSize === size 
                          ? 'bg-brand-orange text-white border-brand-orange' 
                          : 'border-gray-300 text-gray-700 hover:border-brand-orange'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize === null && (
                  <p className="text-sm text-red-500 mt-2">
                    * Please select a size
                  </p>
                )}
              </div>
              
              {/* Quantity */}
              <div>
                <h3 className="text-lg font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center"
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center"
                    disabled={quantity === product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <p className="ml-4 text-gray-600">
                    {product.stock} items available
                  </p>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <Button 
                className="w-full bg-brand-orange hover:bg-brand-orange/90 py-6"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < review.rating ? "fill-brand-orange text-brand-orange" : "text-gray-300"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="font-medium">{review.username}</span>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
