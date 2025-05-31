
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <section className="bg-white p-8 rounded-lg shadow-sm mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About JE's Palace</h1>
            <p className="text-gray-600 mb-6">
              Founded in 2024, JE is a premium footwear brand committed to combining comfort, 
              style, and sustainability.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-700">
                To redefine luxury through meticulously crafted men’s footwear that blends elegance, comfort, and cultural pride
                — empowering every gentleman to walk with distinction and live with purpose 
                while maximizing comfort and style for our customers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-3">Our Values</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Sustainable materials and ethical manufacturing</li>
                  <li>Innovative design and exceptional comfort</li>
                  <li>Customer satisfaction and transparency</li>
                  <li>Community engagement and giving back</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Our Commitment</h2>
                <p className="text-gray-600">
                  At JE’s Palace, we are committed to delivering unmatched quality, timeless style, 
                  and exceptional customer experience. We pledge to uphold the highest standards in 
                  craftsmanship and service, ensuring every pair of footwear reflects our dedication 
                  to luxury, comfort, and the refined tastes of the modern man.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-white p-8 rounded-lg shadow-sm mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-600 mb-6">
              At the heart of JE’s Palace is a dynamic duo with a shared vision for 
              excellence in men’s fashion. Founded by Joel and Emmanuel, JE’s Palace 
              represents more than just their initials — it symbolizes a strong partnership 
              built on creativity, trust, and a passion for redefining African luxury.
              Together, they blend innovation with tradition, bringing unique perspectives 
              to every design. Joel, with an eye for timeless elegance, ensures each product 
              reflects premium quality and style. Emmanuel, driven by strategic vision and customer 
              experience, brings the brand’s lifestyle ethos to life in every detail.
              Their combined talents are the soul of JE’s Palace — a brand where every 
              step you take is backed by dedication, distinction, and purpose.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
              <div className="text-center">
                <img src="https://imgur.com/n24hVbg.jpg" alt="Joel" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow"/>
                <h3 className="font-semibold">Joel</h3>
                <p className="text-gray-500 text-sm">Co-Founder & Creative Lead</p>
              </div>
              <div className="text-center">
                <img src ="https://imgur.com/zLYvxig.jpg" alt ="Emmanuel" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow"/>
                <h3 className="font-semibold">Emmanuel</h3>
                <p className="text-gray-500 text-sm">Co-Founder & Strategy Lead</p>
              </div>
            </div>
          </section>
          
          <Separator className="my-8" />
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to experience JE's Palace?</h2>
            <p className="text-gray-600 mb-6">Browse our collection and find your perfect pair.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
