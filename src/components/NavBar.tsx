
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-brand-black">
            <span className="text-brand-orange">JHOEY</span>-SILICON
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-brand-black font-medium hover:text-brand-orange transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-brand-black font-medium hover:text-brand-orange transition-colors">
              Products
            </Link>
            <Link to="/about" className="text-brand-black font-medium hover:text-brand-orange transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-brand-black font-medium hover:text-brand-orange transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-brand-black font-medium hover:text-brand-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-brand-black font-medium hover:text-brand-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="text-brand-black font-medium hover:text-brand-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-brand-black font-medium hover:text-brand-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/login" 
                className="text-brand-black font-medium hover:text-brand-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Register
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
