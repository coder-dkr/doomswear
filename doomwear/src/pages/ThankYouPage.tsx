import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
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
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    color: string;
    size: string;
    image: string;
    quantity: number;
  };
  status: string;
  createdAt: string;
}

const ThankYouPage = () => {
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
        const token =  Cookies.get('token')
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-6 text-gray-600">{error || "Order details could not be loaded."}</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-green-50 rounded-lg p-6 flex items-start space-x-4 mb-8">
          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-green-800">Order Placed Successfully!</h2>
            <p className="text-green-700">
              Thank you for your purchase. Your order has been confirmed and will be processed soon.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-pink-600 text-white p-6">
            <h1 className="text-2xl font-bold">Order Confirmation</h1>
            <p className="text-pink-100">Order #{order.orderNumber}</p>
            <p className="text-pink-100 text-sm mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Name:</span> {order.customerInfo.fullName}</p>
                  <p><span className="font-medium">Email:</span> {order.customerInfo.email}</p>
                  <p><span className="font-medium">Phone:</span> {order.customerInfo.phoneNumber ?? "Not Provided"}</p>
                </div>
                
                <h2 className="text-lg font-semibold mt-6 mb-3">Shipping Address</h2>
                <div className="space-y-1 text-gray-700">
                  <p>{order.customerInfo.address}</p>
                  <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
                <div className="mb-4">
                  <div className="flex space-x-3 mb-3">
                    <div className="bg-gray-100 rounded-md w-16 h-16 flex-shrink-0">
                      <img className='object-contain' src={order.product?.image} alt={order.product.name} />
                    </div>
                    <div>
                      <p className="font-medium">{order.product.name}</p>
                      <div className="text-sm text-gray-600">
                        <p>Color: {order.product.color}</p>
                        <p>Size: {order.product.size}</p>
                        <p>Quantity: {order.product.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
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
              <p className="text-gray-600 mb-4">
                We've sent a confirmation email to <span className="font-medium">{order.customerInfo.email}</span> with all the order details.
              </p>
              <div className="flex space-x-4">
                <Button className='bg-teal-300' asChild>
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
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

export default ThankYouPage;