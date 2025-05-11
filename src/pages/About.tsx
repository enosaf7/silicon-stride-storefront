
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Silicon</h1>
            <p className="text-gray-600 mb-6">
              Founded in 2020, Silicon is a premium footwear brand committed to combining comfort, 
              style, and sustainability.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-700">
                To create innovative, high-quality footwear that minimizes environmental impact 
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
                  We are committed to reducing our carbon footprint by using recycled and sustainable 
                  materials in our products. By 2025, we aim to have all our products made from at 
                  least 70% sustainable materials.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-white p-8 rounded-lg shadow-sm mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-600 mb-6">
              Silicon is powered by a diverse team of passionate individuals dedicated to 
              revolutionizing the footwear industry.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((team) => (
                <div key={team} className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold">Team Member {team}</h3>
                  <p className="text-gray-500 text-sm">Position</p>
                </div>
              ))}
            </div>
          </section>
          
          <Separator className="my-8" />
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to experience Silicon?</h2>
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
