
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { Product, SearchFilters } from '@/utils/types';
import { Search, Filter, X } from 'lucide-react';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialSearch,
    category: initialCategory !== 'all' ? initialCategory : undefined,
    priceRange: undefined,
    sortBy: undefined
  });
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPrice, setMaxPrice] = useState(500);

  // Fetch products and categories
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch all products first to get categories and max price
        const { data: allProducts, error: productsError } = await supabase
          .from('products')
          .select('*');
          
        if (productsError) throw productsError;
        
        if (allProducts && allProducts.length > 0) {
          // Extract categories
          const uniqueCategories = ['all', ...new Set(allProducts.map(p => p.category))];
          setCategories(uniqueCategories);
          
          // Find the maximum price
          const highest = Math.max(...allProducts.map(p => p.price));
          setMaxPrice(highest);
          setPriceRange([0, highest]);
          
          // Apply filters based on URL params
          filterProducts(allProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductsAndCategories();
  }, []); // Only run on initial load
  
  // Filter products when filters change
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('products').select('*');
        
        // Apply category filter
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        // Apply search filter if provided
        if (filters.query && filters.query.trim() !== '') {
          query = query.ilike('name', `%${filters.query}%`);
        }
        
        // Get results
        const { data, error } = await query;
        
        if (error) throw error;
        
        let filteredProducts = data || [];
        
        // Apply price range filter client-side
        if (filters.priceRange) {
          filteredProducts = filteredProducts.filter(
            product => product.price >= filters.priceRange![0] && product.price <= filters.priceRange![1]
          );
        }
        
        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price-asc':
              filteredProducts.sort((a, b) => a.price - b.price);
              break;
            case 'price-desc':
              filteredProducts.sort((a, b) => b.price - a.price);
              break;
            case 'rating':
              filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
            case 'newest':
              // Assuming newer products have higher IDs or other indicators
              // This is simplified - in a real app you'd sort by a date field
              filteredProducts.reverse();
              break;
          }
        }
        
        setProducts(filteredProducts);
        
        // Update URL params
        updateSearchParams();
      } catch (error) {
        console.error('Error filtering products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    applyFilters();
  }, [filters]);
  
  const filterProducts = (allProducts: Product[]) => {
    let filtered = [...allProducts];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply search query
    if (filters.query && filters.query.trim() !== '') {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        product => product.price >= filters.priceRange![0] && product.price <= filters.priceRange![1]
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          // Simplified for now
          filtered.reverse();
          break;
      }
    }
    
    setProducts(filtered);
  };
  
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category);
    }
    
    if (filters.query && filters.query.trim() !== '') {
      params.set('search', filters.query);
    }
    
    setSearchParams(params);
  };
  
  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category
    }));
  };
  
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const applyPriceRange = () => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange as [number, number]
    }));
  };
  
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any
    }));
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('search') as string;
    
    setFilters(prev => ({
      ...prev,
      query
    }));
  };
  
  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setFilters({
      query: '',
      category: undefined,
      priceRange: undefined,
      sortBy: undefined
    });
    setSearchParams({});
  };
  
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Our Products</h1>
          
          {/* Search Bar (visible on this page) */}
          <form onSubmit={handleSearchSubmit} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  name="search"
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={filters.query || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
              <Button type="submit" className="bg-brand-orange hover:bg-brand-orange/90">
                Search
              </Button>
              {(filters.query || filters.category || filters.priceRange || filters.sortBy) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </form>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <Filter className="h-5 w-5 text-gray-500" />
                </div>
                
                {/* Category Filters */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Button
                          variant="ghost"
                          className={`w-full justify-start px-2 ${
                            (category === 'all' && !filters.category) || 
                            filters.category === category ? 'text-brand-orange font-medium' : ''
                          }`}
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, maxPrice]}
                      max={maxPrice}
                      step={1}
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Button 
                      onClick={applyPriceRange} 
                      className="w-full bg-brand-orange hover:bg-brand-orange/90"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
                
                {/* Sort Options */}
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-2 ${filters.sortBy === 'price-asc' ? 'text-brand-orange font-medium' : ''}`}
                      onClick={() => handleSortChange('price-asc')}
                    >
                      Price: Low to High
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-2 ${filters.sortBy === 'price-desc' ? 'text-brand-orange font-medium' : ''}`}
                      onClick={() => handleSortChange('price-desc')}
                    >
                      Price: High to Low
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-2 ${filters.sortBy === 'rating' ? 'text-brand-orange font-medium' : ''}`}
                      onClick={() => handleSortChange('rating')}
                    >
                      Top Rated
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-2 ${filters.sortBy === 'newest' ? 'text-brand-orange font-medium' : ''}`}
                      onClick={() => handleSortChange('newest')}
                    >
                      Newest
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Loading products...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found with the selected filters.</p>
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Products;
