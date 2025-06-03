
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import ProfileMenu from '@/components/ProfileMenu';
import { ShoppingCart, Menu, X } from 'lucide-react';

const NavBar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Don't show the navbar on the login or signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }
  
  // Simplified admin header for admin pages
  if (isAdminPage) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-brand-orange">JE's Palace</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user && <ProfileMenu />}
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl text-brand-orange">JE's Palace</span>
          </Link>
          
          {/* Search Bar - hidden on mobile, shown in mobile menu */}
          <div className="hidden lg:block flex-grow mx-4 max-w-md">
            <SearchBar />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link to="/products" className="text-gray-600 hover:text-brand-orange transition-colors">
                Products
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
            </nav>
            
            {/* User Controls */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" aria-label="Cart">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </Link>
                  <ProfileMenu />
                </>
              ) : (
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link to="/cart">
                <Button variant="ghost" size="icon" aria-label="Cart">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <SearchBar />
            </div>
            
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-3 mb-4">
              <Link 
                to="/products" 
                className="text-gray-600 hover:text-brand-orange transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className="text-gray-600 hover:text-brand-orange transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-brand-orange transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-brand-orange transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            
            {/* Mobile User Controls */}
            <div className="border-t pt-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Welcome back!</span>
                  <ProfileMenu />
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
