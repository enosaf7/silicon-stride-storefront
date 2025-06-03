
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-gray-100 to-white py-8 md:py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Content */}
          <div className="lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Experience The Future Of <span className="text-brand-orange">Footwear</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Step into comfort with our revolutionary silicon technology, designed to provide unmatched support, style, and durability.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Link to="/products">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="w-full sm:w-auto">Learn More</Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="lg:w-1/2 relative mt-6 lg:mt-0">
            <div className="bg-brand-orange rounded-full w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 absolute -z-10 top-2 right-2 md:top-4 md:right-4"></div>
            <img 
              src="https://imgur.com/ZXmVZUI.jpg" 
              alt="JE's Palace logo" 
              className="w-full h-auto rounded-lg shadow-lg max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
