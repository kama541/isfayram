import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';
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
import { Reports } from './pages/admin/Reports';
import { TablesManagement } from './pages/admin/TablesManagement';
import { QRMenu } from './pages/admin/QRMenu';
import { Invoices } from './pages/admin/Invoices';
import { Purchases } from './pages/admin/Purchases';
import { Fiscalization } from './pages/admin/Fiscalization';
import { CashierTables } from './pages/cashier/CashierTables';
import { Customers } from './pages/cashier/Customers';
import { Reservations } from './pages/cashier/Reservations';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('currentUser');
  const adminStr = localStorage.getItem('adminUser'); // for admin

  if (allowedRoles.includes('admin') && adminStr) {
    return <>{children}</>;
  }

  if (userStr) {
    const user = JSON.parse(userStr);
    if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }
  }

  return <Navigate to="/login" replace />;
};

const SystemClosedWrapper = ({ children }: { children: React.ReactNode }) => {
  const isSystemOpen = useStore(state => state.isSystemOpen);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCustomerRoute = location.pathname.startsWith('/menu');
  
  if (!isSystemOpen && !isAdminRoute && !isCustomerRoute) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-3xl max-w-md text-center border border-slate-200 shadow-2xl">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-red-200">
            <Power className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Tizim Yopilgan</h1>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            Hozircha tizim faoliyati vaqtincha to'xtatilgan. Iltimos adminga murojaat qiling.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

function App() {
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const initRealtime = useStore(state => state.initRealtime);
  const theme = useStore(state => state.theme);
  
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
            <SystemClosedWrapper>
              <Routes>
                {/* Auth Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><FinanceManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/tables" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><TablesManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/qr" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><QRMenu /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StaffManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><InventoryManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Invoices /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/purchases" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Purchases /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/fiscal" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Fiscalization /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Settings /></DashboardLayout></ProtectedRoute>} />
              
              {/* Other legacy admin routes that might be referenced but not in the main sidebar */}
              <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><MenuManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><OrdersManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Reports /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/cameras" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><CameraManagement /></DashboardLayout></ProtectedRoute>} />

              {/* Cashier Routes */}
              <Route path="/cashier" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><CashierDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/tables" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><CashierTables /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/kitchen" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><KDS department="all" /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/reservations" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><Reservations /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/customers" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><Customers /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/finance" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><FinanceManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/menu" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><MenuManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/settings" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><Settings /></DashboardLayout></ProtectedRoute>} />
              
              {/* Other legacy cashier routes */}
              <Route path="/cashier/orders" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><OrdersManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/new-order" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><NewOrder /></DashboardLayout></ProtectedRoute>} />

              {/* Waiter Routes */}
              <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/new-order" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><NewOrder /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/tables" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout></ProtectedRoute>} />

              {/* Customer QR Routes */}
              <Route path="/menu/:tableId" element={<CustomerMenu />} />

              {/* KDS Route */}
              <Route path="/kds/:department" element={<KDS />} />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </SystemClosedWrapper>
          </BrowserRouter>
        )}
      </>
    </ErrorBoundary>
  );
}

export default App;
