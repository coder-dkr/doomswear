import { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {type User} from '@/types/types'
import { AuthContext } from '@/context/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL


const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          Cookies.remove('token');
          console.error('Authentication failed:', error);
        }
      }
      setLoading(false);
    };
  
    useEffect(() => {
      initAuth();
    }, []);
  
    const login = async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, { email, password });
        const { token, user } = response.data;
        Cookies.set('token', token, { expires: 7 });
        setUser(user);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
    const signup = async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/signup`, { name, email, password });
        const { token, user } = response.data;
        Cookies.set('token', token, { expires: 7 });
        setUser(user);
      } catch (error) {
        console.error('Signup failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
    const logout = () => {
      Cookies.remove('token');
      setUser(null);
    };
  
    return (
      <AuthContext.Provider value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        isAuthenticated: !!user 
      }}>
        {children}
      </AuthContext.Provider>
    );
  };
  

  export default AuthProvider