import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-pink-500" />
              <span className="font-bold text-xl text-pink-500">DoomSwear</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for premium quality apparel with unique designs that express your coding passion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-black transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">123 Doom Street</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">+91 98183238XX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">support@doomswear.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} DoomSwear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;