
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully logged in!');
      setIsLoading(false);
      
      // In a real app, this would save auth token, update context, and redirect
    }, 1500);
  };
  
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-6">Log In to Your Account</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-brand-orange text-sm hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                
                <Button
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-brand-orange/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-orange hover:underline">
                  Sign up
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

export default Login;
