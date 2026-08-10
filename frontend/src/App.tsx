import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';

import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';

import ChallanList from './pages/challans/ChallanList';
import NewChallan from './pages/challans/NewChallan';
import ChallanDetail from './pages/challans/ChallanDetail';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Customer Routes */}
      <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
      <Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
      <Route path="/customers/:id/edit" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
      
      {/* Product Routes */}
      <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />

      {/* Challan Routes */}
      <Route path="/challans" element={<ProtectedRoute><ChallanList /></ProtectedRoute>} />
      <Route path="/challans/new" element={<ProtectedRoute><NewChallan /></ProtectedRoute>} />
      <Route path="/challans/:id" element={<ProtectedRoute><ChallanDetail /></ProtectedRoute>} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>🚧 Dashboard Coming Soon</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Phase 0 complete. Building modules next.
              </p>
              <div style={{ marginTop: '20px' }}>
                <a href="/customers" style={{ marginRight: '10px' }} className="btn btn-primary">Go to Customers</a>
                <a href="/products" style={{ marginRight: '10px' }} className="btn-primary btn">Go to Products</a>
                <a href="/challans" className="btn btn-primary">Go to Challans</a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
