import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';

// Shared Components
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';

import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';

import ChallanList from './pages/challans/ChallanList';
import NewChallan from './pages/challans/NewChallan';
import ChallanDetail from './pages/challans/ChallanDetail';

// Role specific containers
import DashboardContainer from './pages/dashboard/DashboardContainer';
import AnalyticsContainer from './pages/analytics/AnalyticsContainer';
import UsersPlaceholder from './pages/settings/UsersPlaceholder';
import SettingsPlaceholder from './pages/settings/SettingsPlaceholder';

import './index.css';
import { useAuth } from './context/AuthContext';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }
  
  if (user) {
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'SALES': return <Navigate to="/sales" replace />;
      case 'WAREHOUSE': return <Navigate to="/warehouse" replace />;
      case 'ACCOUNTS': return <Navigate to="/accounts" replace />;
      default: return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* ====================================================================== */}
      {/* ADMIN ROUTES */}
      {/* ====================================================================== */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardContainer />} />
        <Route path="analytics" element={<AnalyticsContainer />} />
        
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />

        <Route path="challans" element={<ChallanList />} />
        <Route path="challans/new" element={<NewChallan />} />
        <Route path="challans/:id" element={<ChallanDetail />} />

        <Route path="users" element={<UsersPlaceholder />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
      </Route>

      {/* ====================================================================== */}
      {/* SALES ROUTES */}
      {/* ====================================================================== */}
      <Route path="/sales" element={<ProtectedRoute allowedRoles={['SALES']}><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardContainer />} />
        <Route path="analytics" element={<AnalyticsContainer />} />
        
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />

        <Route path="challans" element={<ChallanList />} />
        <Route path="challans/new" element={<NewChallan />} />
        <Route path="challans/:id" element={<ChallanDetail />} />
      </Route>

      {/* ====================================================================== */}
      {/* WAREHOUSE ROUTES */}
      {/* ====================================================================== */}
      <Route path="/warehouse" element={<ProtectedRoute allowedRoles={['WAREHOUSE']}><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardContainer />} />
        <Route path="analytics" element={<AnalyticsContainer />} />
        
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />

        <Route path="challans" element={<ChallanList />} />
        <Route path="challans/:id" element={<ChallanDetail />} />
      </Route>

      {/* ====================================================================== */}
      {/* ACCOUNTS ROUTES */}
      {/* ====================================================================== */}
      <Route path="/accounts" element={<ProtectedRoute allowedRoles={['ACCOUNTS']}><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardContainer />} />
        <Route path="analytics" element={<AnalyticsContainer />} />
        
        <Route path="challans" element={<ChallanList />} />
        <Route path="challans/:id" element={<ChallanDetail />} />
      </Route>

      {/* Fallback for completely unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
