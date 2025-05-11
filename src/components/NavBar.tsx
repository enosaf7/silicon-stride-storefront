
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileMenu from './ProfileMenu';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Silicon
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-brand-orange transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-brand-orange transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-brand-orange transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-brand-orange transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-brand-orange transition-colors">
              Contact
            </Link>
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button onClick={toggleSearch} aria-label="Search" className="text-gray-700 hover:text-brand-orange transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* Shopping Cart */}
            <Link to="/cart" className="text-gray-700 hover:text-brand-orange transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {/* Profile Menu */}
            <ProfileMenu />
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden text-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && isMobile && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/" className="block text-gray-600 hover:text-brand-orange transition-colors">
              Home
            </Link>
            <Link to="/products" className="block text-gray-600 hover:text-brand-orange transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="block text-gray-600 hover:text-brand-orange transition-colors">
              Categories
            </Link>
            <Link to="/about" className="block text-gray-600 hover:text-brand-orange transition-colors">
              About
            </Link>
            <Link to="/contact" className="block text-gray-600 hover:text-brand-orange transition-colors">
              Contact
            </Link>
          </div>
        )}
        
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pt-3 pb-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for products..." 
                className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded"
              />
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button 
                onClick={toggleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
