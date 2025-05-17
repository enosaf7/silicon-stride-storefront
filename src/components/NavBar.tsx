
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import ProfileMenu from '@/components/ProfileMenu';
import ChatButton from '@/components/ChatButton';
import { ShoppingCart } from 'lucide-react';

const NavBar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
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
            <span className="font-bold text-xl text-brand-orange">JE's Palace</span>
          </Link>
          
          {/* Search Bar - hidden on mobile */}
          <div className="hidden md:block flex-grow mx-4 max-w-md">
            <SearchBar />
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
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
                  <ChatButton />
                  <ProfileMenu />
                </>
              ) : (
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="mt-2 md:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default NavBar;
