
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/utils/types';

interface SearchBarProps {
  isOpen: boolean;
  toggleSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, toggleSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isOpen) toggleSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSearch]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    toggleSearch();
    setQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      toggleSearch();
    }
  };

  return (
    <div ref={searchRef} className={`w-full ${isOpen ? 'block' : 'hidden'}`}>
      <div className="pt-3 pb-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full p-2 pl-10 pr-10 border border-gray-300 rounded"
          />
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            type="button"
            onClick={toggleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </form>

        {/* Search Results Dropdown */}
        {query.length >= 2 && (
          <div className="absolute z-20 bg-white shadow-lg rounded-md mt-1 w-full max-w-md">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((product) => (
                  <li 
                    key={product.id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="p-3 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </li>
                ))}
                <li className="border-t px-3 py-2 text-center">
                  <button 
                    onClick={handleSearchSubmit}
                    className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium"
                  >
                    See all results
                  </button>
                </li>
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No products found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
