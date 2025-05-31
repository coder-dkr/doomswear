import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { isAxiosError } from 'axios';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: string })?.from || '/';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // toast({
      //   title: "Login Successful",
      //   description: "Welcome back to DoomSwear!",
      // });
      navigate(from);
    } catch (error) {
      // const errorMessage = error.response?.data?.message || 'Failed to login. Please check your credentials.';
      // toast({
      //   title: "Login Failed",
      //   description: errorMessage,
      //   variant: "destructive"
      // });
      if(isAxiosError(error)) {
        setError(error.response?.data.message)
      }
      console.error(error)
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Log in to your DoomSwear account</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        type="email" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"} 
                          {...field}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <p className="text-sm text-pink-600 hover:text-pink-800">
                  Forgot password?
                </p>
              </div>
              
              {error && <p className='text-red-500 text-sm'>{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-pink-600 hover:bg-pink-700 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className='text-white font-medium'>Log in</span>
                )}
              </Button>
              
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-pink-600 hover:text-pink-800 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
        
        
      </motion.div>
    </div>
  );
};

export default LoginPage;