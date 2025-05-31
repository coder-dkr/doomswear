import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductPage from '@/pages/ProductPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ThankYouPage from '@/pages/ThankYouPage';
import FailurePage from '@/pages/FailurePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AuthProvider from '@/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
            <Route path="/failure/:orderId" element={<FailurePage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;