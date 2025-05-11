
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Account created successfully! Please check your email to verify your account.');
      setIsLoading(false);
      
      // In a real app, this would redirect to login or dashboard
    }, 1500);
  };
  
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {formData.password && formData.confirmPassword && 
                   formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-sm">Passwords do not match</p>
                  )}
                </div>
                
                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <label 
                    htmlFor="terms" 
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-brand-orange hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-brand-orange hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-brand-orange/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-orange hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
