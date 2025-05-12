
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileMenu from './ProfileMenu';
import SearchBar from './SearchBar';
import { useCart } from '@/contexts/CartContext';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const { itemCount } = useCart();
  
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
            Jhoey-Silicon
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
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
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
        <SearchBar isOpen={isSearchOpen} toggleSearch={toggleSearch} />
      </div>
    </nav>
  );
};

export default NavBar;
