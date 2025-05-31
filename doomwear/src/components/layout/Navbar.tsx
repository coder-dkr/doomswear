import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  
  User, 
  Menu, 
  X, 
  LogOut,
  ShoppingBag,
  History
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-pink-500" />
          <span className="font-bold text-xl text-pink-500">DoomSwear</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white'>
                <DropdownMenuItem className="text-sm font-medium">
                  Hello, {user?.name}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm font-medium">
                  <b>Wallte</b> - {user?.wallet.toFixed(2)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Login
              </Button>
            </Link>
          )}

          <Link to="/" className="relative">
            <History className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-pink-500 text-white text-xs rounded-full">
              {user?.transactions.length ?? 
              "0"}
            </span>
          </Link>

          <Button 
            variant="ghost" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-white z-50 md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex justify-end p-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col items-center space-y-6 mt-16">
              {!isAuthenticated && (
                <Link 
                  to="/login" 
                  className="mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="default">Login</Button>
                </Link>
              )}
              {isAuthenticated && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4"
                >
                  Logout
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;