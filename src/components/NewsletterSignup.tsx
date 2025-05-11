
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for subscribing to our newsletter!');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-brand-orange py-16">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-white/80 mb-8">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="bg-white border-0 flex-grow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-brand-black hover:bg-brand-black/80 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
