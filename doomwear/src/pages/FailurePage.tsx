import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_BASE_URL

interface OrderDetails {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    color: string;
    size: string;
    quantity: number;
  };
  status: string;
  createdAt: string;
}

const FailurePage = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { orderId } = useParams<{ orderId: string }>();
  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },[])
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = Cookies.get('token')
        const response = await axios.get(`${BASE_URL}/api/v1/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrder(response.data.order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Unable to load order details. Please try again later.');
        // toast({
        //   title: "Error",
        //   description: "Failed to load order details",
        //   variant: "destructive"
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-6 text-gray-600">{error || "Order details could not be loaded."}</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getFailureMessage = () => {
    if (order.status === 'declined') {
      return {
        title: "Payment Declined",
        description: "Your payment was declined by your bank or card issuer. Please try a different payment method."
      };
    } else {
      return {
        title: "Payment Error",
        description: "We encountered a technical issue while processing your payment. This is not a problem with your card or account."
      };
    }
  };

  

  const failureMessage = getFailureMessage();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-red-50 rounded-lg p-6 flex items-start space-x-4 mb-8">
          <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-800">{failureMessage.title}</h2>
            <p className="text-red-700">
              {failureMessage.description}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-6">
            <h1 className="text-2xl font-bold">Order Status</h1>
            <p className="text-gray-300">Order #{order.orderNumber}</p>
            <p className="text-gray-300 text-sm mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 mr-2">
                {order.status.toUpperCase()}
              </span>
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-3">Order Information</h2>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Product:</span> {order.product.name}</p>
                  <p><span className="font-medium">Color:</span> {order.product.color}</p>
                  <p><span className="font-medium">Size:</span> {order.product.size}</p>
                  <p><span className="font-medium">Quantity:</span> {order.product.quantity}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3">Payment Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{(order.product.price * order.product.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-6">
                We've sent an email to <span className="font-medium">{order.customerInfo.email}</span> with details about this failed transaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Link to="/checkout" className="flex items-center text-white">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Shop
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FailurePage;