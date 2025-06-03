
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white pt-8 md:pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg md:text-xl mb-3 md:mb-4 font-bold">
              <span className="text-brand-orange">JE's</span> PALACE
            </h3>
            <p className="text-gray-300 mb-4 text-sm md:text-base">
              Premium footwear with advanced silicon technology for unmatched comfort and style.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-base md:text-lg mb-3 md:mb-4 font-semibold">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=shoes" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/products?category=slippers" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Slippers
                </Link>
              </li>
              <li>
                <Link to="/products?category=boots" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Boots
                </Link>
              </li>
              <li>
                <Link to="/products?category=sandals" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Sandals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-base md:text-lg mb-3 md:mb-4 font-semibold">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Store Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div>
            <h4 className="text-base md:text-lg mb-3 md:mb-4 font-semibold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-brand-orange transition-colors text-sm md:text-base">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 md:pt-6 border-t border-gray-700 text-center text-gray-400 text-xs md:text-sm">
          <p>
            © {currentYear} JE's Palace Shoes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
