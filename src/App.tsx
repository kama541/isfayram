import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MenuManagement } from './pages/admin/MenuManagement';
import { OrdersManagement } from './pages/admin/OrdersManagement';
import { StaffManagement } from './pages/admin/StaffManagement';
import { CashierDashboard } from './pages/cashier/CashierDashboard';
import { WaiterDashboard } from './pages/waiter/WaiterDashboard';
import { NewOrder } from './pages/waiter/NewOrder';
import { CustomerMenu } from './pages/customer/CustomerMenu';
import { Login } from './pages/Login';
import { useStore } from './store/useStore';
import { ErrorBoundary } from './ErrorBoundary';
import { AdminLogin } from './pages/admin/AdminLogin';
import { FinanceManagement } from './pages/admin/FinanceManagement';
import { CameraManagement } from './pages/admin/CameraManagement';
import { InventoryManagement } from './pages/admin/InventoryManagement';
import { Settings } from './pages/admin/Settings';
import { KDS } from './pages/kds/KDS';

function App() {
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const initRealtime = useStore(state => state.initRealtime);
  
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    fetchInitialData();
    initRealtime();
  }, [fetchInitialData, initRealtime]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  return (
    <ErrorBoundary>
      <>
        <AnimatePresence mode="wait">
          {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
        </AnimatePresence>

        {!showSplash && (
          <BrowserRouter>
            <Routes>
              {/* Auth Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>} />
              <Route path="/admin/menu" element={<DashboardLayout role="admin"><MenuManagement /></DashboardLayout>} />
              <Route path="/admin/orders" element={<DashboardLayout role="admin"><OrdersManagement /></DashboardLayout>} />
              <Route path="/admin/staff" element={<DashboardLayout role="admin"><StaffManagement /></DashboardLayout>} />
              <Route path="/admin/finance" element={<DashboardLayout role="admin"><FinanceManagement /></DashboardLayout>} />
              <Route path="/admin/inventory" element={<DashboardLayout role="admin"><InventoryManagement /></DashboardLayout>} />
              <Route path="/admin/cameras" element={<DashboardLayout role="admin"><CameraManagement /></DashboardLayout>} />
              <Route path="/admin/settings" element={<DashboardLayout role="admin"><Settings /></DashboardLayout>} />

              {/* Cashier Routes */}
              <Route path="/cashier" element={<DashboardLayout role="cashier"><CashierDashboard /></DashboardLayout>} />
              <Route path="/cashier/orders" element={<DashboardLayout role="cashier"><OrdersManagement /></DashboardLayout>} />
              <Route path="/cashier/finance" element={<DashboardLayout role="cashier"><FinanceManagement /></DashboardLayout>} />
              <Route path="/cashier/new-order" element={<DashboardLayout role="cashier"><NewOrder /></DashboardLayout>} />

              {/* Waiter Routes */}
              <Route path="/waiter" element={<DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout>} />
              <Route path="/waiter/new-order" element={<DashboardLayout role="waiter"><NewOrder /></DashboardLayout>} />
              <Route path="/waiter/tables" element={<DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout>} />

              {/* Customer QR Routes */}
              <Route path="/menu/:tableId" element={<CustomerMenu />} />

              {/* KDS Route */}
              <Route path="/kds/:department" element={<KDS />} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </>
    </ErrorBoundary>
  );
}

export default App;
