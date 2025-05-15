
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-gray-100 to-white py-12 md:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Content */}
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Experience The Future Of <span className="text-brand-orange">Footwear</span>
            </h1>
            <p className="text-lg text-gray-600">
              Step into comfort with our revolutionary silicon technology, designed to provide unmatched support, style, and durability.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="md:w-1/2 relative">
            <div className="bg-brand-orange rounded-full w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 absolute -z-10 top-4 right-4"></div>
            <img 
              src= "https://sdmntprwestus3.oaiusercontent.com/files/00000000-bedc-61fd-9efa-99e6161a0c1c/raw?se=2025-05-15T03%3A47%3A03Z&sp=r&sv=2024-08-04&sr=b&scid=00000000-0000-0000-0000-000000000000&skoid=7399a3a4-0259-4d43-bcd6-a56ceeb4c28b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-15T02%3A22%3A24Z&ske=2025-05-16T02%3A22%3A24Z&sks=b&skv=2024-08-04&sig=K/8UoU2/auIb7sJokA78V3RwJj0Nb1gQpHuOCi3GYOQ%3D" 
              alt="JE's Palace Executive Shoe" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
