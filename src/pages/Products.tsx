
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { Product } from '@/utils/types';
import { Button } from '@/components/ui/button';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Categories derived from products data
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];
  
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
    
    // Update URL params when category changes
    if (selectedCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', selectedCategory);
    }
    setSearchParams(searchParams);
  }, [selectedCategory, searchParams, setSearchParams]);
  
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Our Products</h1>
          
          {/* Category Filters */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-brand-orange hover:bg-brand-orange/90" : ""}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Products;
