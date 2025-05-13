
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="h-5 w-5" />
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: <Star className="h-5 w-5" />
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="h-5 w-5" />
    }
  ];
  
  // Close sidebar on mobile when path changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);
  
  // Check if window is small on mount
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => window.removeEventListener('resize', checkWidth);
  }, []);
  
  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden p-4 bg-white border-b">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Sidebar for desktop */}
        <div
          className={`${
            isSidebarOpen ? 'md:w-64' : 'md:w-20'
          } hidden md:block transition-all duration-300 bg-white border-r`}
        >
          <div className="p-4">
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 px-4 ${
                  location.pathname === item.path ? 'bg-gray-100 text-brand-orange' : 'text-gray-700'
                } hover:bg-gray-100 transition-colors`}
              >
                {item.icon}
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className={`flex w-full items-center justify-${isSidebarOpen ? 'start' : 'center'} py-3 px-4 text-gray-700 hover:bg-gray-100 transition-colors`}
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
        
        {/* Mobile sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-64 h-full bg-white">
              <div className="p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">Admin</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center py-3 px-4 ${
                      location.pathname === item.path ? 'bg-gray-100 text-brand-orange' : 'text-gray-700'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start py-3 px-4 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLayout;
