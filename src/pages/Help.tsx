
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, HelpCircle, ShoppingBag, Truck } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
            <p className="text-lg text-gray-600">
              We're here to help! Find answers to your questions or get in touch with our support team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-brand-orange" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I place an order?</h3>
                  <p className="text-sm text-gray-600">
                    Browse our products, add items to your cart, and proceed to checkout. You can pay via mobile money.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-sm text-gray-600">
                    We accept mobile money payments including MTN Mobile Money and Airtel Money.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How long does delivery take?</h3>
                  <p className="text-sm text-gray-600">
                    Delivery typically takes 1-3 business days within the city and 3-7 days for remote areas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-orange" />
                  Order Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Track Your Order</h3>
                  <p className="text-sm text-gray-600">
                    You can track your order status in your account dashboard or contact us for updates.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Return Policy</h3>
                  <p className="text-sm text-gray-600">
                    We offer returns within 7 days of delivery for unused items in original condition.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Size Guide</h3>
                  <p className="text-sm text-gray-600">
                    Check our size charts on product pages to find your perfect fit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">Contact Our Support Team</CardTitle>
              <CardDescription className="text-center">
                Can't find what you're looking for? Get in touch with us directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Get help via email within 24 hours
                  </p>
                  <Button asChild>
                    <a href="mailto:saffiretech01@gmail.com">
                      Contact Support
                    </a>
                  </Button>
                </div>
                
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">WhatsApp Group</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Join our community for updates
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://chat.whatsapp.com/DAEO7WENhXp8rDPrIBsTff" target="_blank" rel="noopener noreferrer">
                      Join WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-gray-600">
                  For urgent matters, email us at: <strong>saffiretech01@gmail.com</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Help;
