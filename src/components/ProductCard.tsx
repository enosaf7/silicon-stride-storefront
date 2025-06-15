
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/utils/types';
import { Star } from 'lucide-react';
import { cn, formatCedi } from '@/lib/utils';
import WishlistButton from './WishlistButton';
import { useProductViews } from '@/hooks/useProductViews';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { trackProductView } = useProductViews();
  // Handle both database and static data field names
  const newArrival = product.newArrival || product.new_arrival;

  const handleClick = () => {
    trackProductView(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={handleClick}
      className={cn(
        "group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative",
        className
      )}
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          draggable={false}
        />
        
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      {/* Labels (New, Discount, Low Stock) */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {newArrival && (
          <span className="bg-brand-black text-white text-xs px-2 py-1 rounded">
            NEW
          </span>
        )}
        {product.discount && (
          <span className="bg-brand-orange text-white text-xs px-2 py-1 rounded">
            {product.discount}% OFF
          </span>
        )}
        {product.stock <= (product.low_stock_threshold || 10) && product.stock > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            LOW STOCK
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-medium text-base md:text-lg mb-1 text-brand-black group-hover:text-brand-orange transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <span className="text-xs md:text-sm text-gray-500">{product.category}</span>
          <span className="text-xs text-gray-400 ml-2">Stock: {product.stock}</span>
        </div>
        {/* Price and Rating */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            {product.discount ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base md:text-lg font-semibold text-brand-orange">
                  {formatCedi(Number(product.price) * (1 - Number(product.discount) / 100))}
                </span>
                <span className="line-through text-gray-400 text-sm">
                  {formatCedi(Number(product.price))}
                </span>
              </div>
            ) : (
              <span className="text-base md:text-lg font-semibold text-brand-black">
                {formatCedi(Number(product.price))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
