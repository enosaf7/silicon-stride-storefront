
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import NewsletterSignup from '@/components/NewsletterSignup';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/utils/types';

const Index: React.FC = () => {
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('new_arrival', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching new arrivals:', error);
        throw error;
      }
      
      return data as Product[];
    }
  });

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        
        <FeaturedProducts />
        
        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose JE's Palace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-brand-orange bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Superior Comfort</h3>
                <p className="text-gray-600">
                  Our patented shoes provides unmatched cushioning and support for all-day comfort.
                </p>
              </div>
              
              {/* Benefit 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-brand-orange bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Durability</h3>
                <p className="text-gray-600">
                  Engineered to last, our footwear maintains its structure and cushioning properties over time.
                </p>
              </div>
              
              {/* Benefit 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-brand-orange bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Eco-friendly</h3>
                <p className="text-gray-600">
                  Sustainably produced using recycled materials and environmentally conscious manufacturing processes.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* New Arrivals Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
            
            {newArrivalsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                ))}
              </div>
            ) : newArrivals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No new arrivals available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newArrivals.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-brand-orange">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "These are the most comfortable shoes I've ever worn. The cushioning makes a huge difference during my long work days. Highly recommend!"
                </p>
                <div className="font-medium">Osafo Enoch.</div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-brand-orange">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "I've tried many brands of sandals, but JE's Palace has been a game-changer. The support and cushioning are exceptional, and they look great too!"
                </p>
                <div className="font-medium">Michael Ohene.</div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-brand-orange">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "Love my new Beach Comfort Sandals! Perfect for summer and incredibly comfortable. The only reason for 4 stars instead of 5 is that they run slightly large."
                </p>
                <div className="font-medium">Kenneth Ntiri.</div>
              </div>
            </div>
          </div>
        </section>
        
        
      </main>
      <Footer />
    </>
  );
};

export default Index;
