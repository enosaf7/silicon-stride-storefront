
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Phone,
  Receipt,
  CreditCard,
  FileImage,
  Check,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';

interface FormValues {
  customerName: string;
  phoneNumber: string;
  screenshot?: FileList;
}

const MoMoCheckout = () => {
  const { cartItems, subtotal, totalCost, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Generate a unique order reference
  const orderRef = `ORDER-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  const form = useForm<FormValues>({
    defaultValues: {
      customerName: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would send this data to your backend
      // For now, we'll simulate a successful payment confirmation
      
      // Generate message content for email and WhatsApp
      const messageContent = generateMessageContent(values, orderRef);
      
      // Send invoice to admin (simulated)
      console.log("Sending invoice to admin:", messageContent);
      
      // Show success message
      toast.success("Payment confirmation submitted!");
      
      // Clear the cart after successful checkout
      await clearCart();
      
      // Redirect to a thank you page after a short delay
      setTimeout(() => {
        navigate('/');
        toast.info("You'll receive a confirmation once your payment is verified.");
      }, 2000);
      
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Failed to confirm payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const generateMessageContent = (values: FormValues, orderRef: string) => {
    const items = cartItems.map(item => {
      const price = item.product?.discount
        ? item.product?.price * (1 - (item.product?.discount / 100))
        : item.product?.price || 0;
      
      return `${item.product?.name} (Size ${item.size}) x ${item.quantity} - $${(price * item.quantity).toFixed(2)}`;
    }).join('\n');
    
    return `
New MoMo Payment Confirmation:
----------------------------
Order Reference: ${orderRef}
Customer Name: ${values.customerName}
Phone Number: ${values.phoneNumber}
Total Amount: $${totalCost.toFixed(2)}

Items:
${items}
    `;
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(`I'd like to confirm my payment for order ${orderRef}`);
    window.open(`https://wa.me/qr/YLDXJYXDR4LHA1?text=${message}`, '_blank');
  };

  const momoSteps = [
    { step: 1, text: "Dial *170#" },
    { step: 2, text: "Select 'Transfer Money'" },
    { step: 3, text: "Choose 'MoMo Pay & Pay Bill'" },
    { step: 4, text: "Select 'Pay Merchant'" },
    { step: 5, text: "Enter merchant ID: {{merchant_id}}" },
    { step: 6, text: "Enter reference: " + orderRef },
    { step: 7, text: "Confirm payment" }
  ];

  return (
    <>
      <NavBar />
      <main className="py-8 px-4 md:py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout with Mobile Money</h1>
            <p className="text-gray-500">Complete your purchase using MTN Mobile Money</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-brand-orange" />
                    Order Summary
                  </h2>
                  <span className="text-sm text-gray-500">Ref: {orderRef}</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    if (!item.product) return null;
                    
                    const itemPrice = item.product.discount
                      ? item.product.price * (1 - item.product.discount / 100)
                      : item.product.price;
                    
                    return (
                      <div key={item.id} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">${(itemPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-brand-orange">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Instructions and Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-brand-orange" />
                  Mobile Money Payment Steps
                </h2>
                
                <div className="space-y-4">
                  {momoSteps.map((step, index) => (
                    <div key={index} className={cn(
                      "flex items-center p-3 rounded-md transition-all",
                      currentStep === step.step 
                        ? "bg-brand-orange bg-opacity-10 border-l-4 border-brand-orange"
                        : "bg-gray-50"
                    )}>
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                        currentStep === step.step
                          ? "bg-brand-orange text-white"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {step.step}
                      </div>
                      <span className={currentStep === step.step ? "font-medium" : ""}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, momoSteps.length))}
                    disabled={currentStep === momoSteps.length}
                    className="bg-brand-orange hover:bg-brand-orange/90"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
              
              {/* Payment Confirmation Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-brand-orange" />
                  Confirm Your Payment
                </h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      rules={{ 
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\s-]{10,15}$/,
                          message: "Please enter a valid phone number"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number Used for Payment</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
                                <Phone className="h-4 w-4 text-gray-500" />
                              </div>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="e.g., 0244123456"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="screenshot"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>
                            Receipt Screenshot (Optional)
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileImage className="w-8 h-8 mb-3 text-gray-400" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or PDF (Max 2MB)</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/png,image/jpeg,application/pdf"
                                  onChange={(e) => {
                                    onChange(e.target?.files || null);
                                  }}
                                  {...fieldProps}
                                />
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex flex-col space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-orange hover:bg-brand-orange/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2">⟳</span> Processing...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Check className="mr-2 h-4 w-4" /> Confirm Payment
                          </span>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={openWhatsApp}
                      >
                        Contact via WhatsApp
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500 mt-4">
                        You'll receive a confirmation once your payment is verified.
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MoMoCheckout;
