
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Categories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Define our main categories
  const categories = [
    {
      id: 'shoes',
      name: 'Shoes',
      description: 'Comfortable and stylish shoes for everyday wear',
      image: '/placeholder.svg'
    },
    {
      id: 'slippers',
      name: 'Slippers',
      description: 'Cozy slippers for relaxation at home',
      image: "https://imgur.com/uZqC77N.jpg"
    },
    {
      id: 'boots',
      name: 'Boots',
      description: 'Durable boots for outdoor activities and winter wear',
      image: '/placeholder.svg'
    },
    {
      id: 'sandals',
      name: 'Sandals',
      description: 'Lightweight sandals for summer and beach days',
      image: '/placeholder.svg'
    }
  ];
  
  const handleCategorySelect = (categoryId: string) => {
    searchParams.set('category', categoryId);
    setSearchParams(searchParams);
  };
  
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Categories</h1>
          <p className="text-gray-600 mb-8">Browse our collection by category</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => handleCategorySelect(category.id)}
                        variant="outline"
                        asChild
                      >
                        <Link to={`/products?category=${category.id}`} className="inline-flex items-center">
                          Browse {category.name} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-8" />
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-600 mb-6">Browse our entire collection of products</p>
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Categories;
