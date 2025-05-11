
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white pt-12 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl mb-4 font-bold">
              <span className="text-brand-orange">JHOEY</span>-SILICON
            </h3>
            <p className="text-gray-300 mb-4">
              Premium footwear with advanced silicon technology for unmatched comfort and style.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg mb-4 font-semibold">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=shoes" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/products?category=slippers" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Slippers
                </Link>
              </li>
              <li>
                <Link to="/products?category=boots" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Boots
                </Link>
              </li>
              <li>
                <Link to="/products?category=sandals" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Sandals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg mb-4 font-semibold">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-brand-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Store Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div>
            <h4 className="text-lg mb-4 font-semibold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-brand-orange transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>
            © {currentYear} Jhoey-Silicon Shoes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
