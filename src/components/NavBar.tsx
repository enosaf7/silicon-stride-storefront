
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProfileMenu from './ProfileMenu';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-brand-orange">StyleHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                  isActivePath(link.path)
                    ? 'text-brand-orange border-b-2 border-brand-orange pb-1'
                    : 'text-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Mobile */}
            <div className="lg:hidden flex-1 max-w-xs">
              <SearchBar />
            </div>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* Shopping Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Profile/Login */}
            {user ? (
              <ProfileMenu />
            ) : (
              <Button 
                onClick={() => navigate('/login')} 
                variant="ghost" 
                size="icon"
                className="text-gray-700 hover:text-brand-orange"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath(link.path)
                      ? 'text-brand-orange bg-orange-50'
                      : 'text-gray-700 hover:text-brand-orange hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-orange hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Wishlist ({wishlistCount})
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
