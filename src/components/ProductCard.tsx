import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/utils/types';
import { Star } from 'lucide-react';
import { cn, formatCedi } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  // Handle both database and static data field names
  const newArrival = product.newArrival || product.new_arrival;

  return (
    <Link
      to={`/product/${product.id}`}
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
      </div>

      {/* Labels (New, Discount) */}
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
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-medium text-base md:text-lg mb-1 text-brand-black group-hover:text-brand-orange transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <span className="text-xs md:text-sm text-gray-500">{product.category}</span>
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
