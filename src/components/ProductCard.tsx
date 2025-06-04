import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/utils/types';
import { Star } from 'lucide-react';
import { cn, formatCedi } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const SLIDE_DURATION = 900; // ms for slide animation
const INTERVAL = 5000; // ms between slides

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const newArrival = product.newArrival || product.new_arrival;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [sliding, setSliding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Slideshow effect
  useEffect(() => {
    if (product.images.length <= 1) return;

    timerRef.current = setInterval(() => {
      const nextIdx = (currentImageIndex + 1) % product.images.length;
      setNextImageIndex(nextIdx);
      setSliding(true);
      // After slide duration, update current image
      slideTimeoutRef.current = setTimeout(() => {
        setCurrentImageIndex(nextIdx);
        setNextImageIndex(null);
        setSliding(false);
      }, SLIDE_DURATION);
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [currentImageIndex, product.images.length]);

  // Manual select image (if you want indicators clickable, add this function)
  const handleIndicatorClick = (idx: number) => {
    if (idx === currentImageIndex || sliding) return;
    setNextImageIndex(idx);
    setSliding(true);
    if (timerRef.current) clearInterval(timerRef.current);
    slideTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(idx);
      setNextImageIndex(null);
      setSliding(false);
    }, SLIDE_DURATION);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative",
        className
      )}
    >
      {/* Product Image Slider */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <div
          className="w-full h-full relative"
          style={{ height: "100%" }}
        >
          {/* Current Image (slide out left if sliding) */}
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className={cn(
              "absolute top-0 left-0 w-full h-full object-cover transition-transform duration-900 will-change-transform",
              sliding && nextImageIndex !== null
                ? "translate-x-[-100%]"
                : "translate-x-0",
              "z-10"
            )}
            style={{
              transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.6,0,0.4,1)`
            }}
            draggable={false}
          />
          {/* Next Image (slide in from right if sliding) */}
          {sliding && nextImageIndex !== null && (
            <img
              src={product.images[nextImageIndex]}
              alt={product.name + " preview"}
              className={cn(
                "absolute top-0 left-0 w-full h-full object-cover transition-transform duration-900 will-change-transform",
                "translate-x-0"
              )}
              style={{
                transform: "translateX(100%)",
                animation: `slideInFromRight ${SLIDE_DURATION}ms cubic-bezier(0.6,0,0.4,1) forwards`
              }}
              draggable={false}
            />
          )}
        </div>

        {/* Image indicators for multiple images */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
            {product.images.map((_, index) => (
              <div
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors cursor-pointer",
                  index === currentImageIndex
                    ? "bg-white ring-2 ring-brand-orange"
                    : "bg-white/50"
                )}
                style={{ transition: 'background 0.3s' }}
              />
            ))}
          </div>
        )}
        {/* Slide in animation keyframes */}
        <style>
          {`
            @keyframes slideInFromRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}
        </style>
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
