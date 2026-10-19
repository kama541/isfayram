import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { GlobalUI } from './components/GlobalUI';
import { RemotePrintListener } from './components/RemotePrintListener';
import { DashboardLayout } from './layouts/DashboardLayout';
import { MenuManagement } from './pages/admin/MenuManagement';
import { OrdersManagement } from './pages/admin/OrdersManagement';
import { StaffManagement } from './pages/admin/StaffManagement';
import { CashierDashboard } from './pages/cashier/CashierDashboard';
import { WaiterDashboard } from './pages/waiter/WaiterDashboard';
import { NewOrder } from './pages/waiter/NewOrder';
import { CustomerMenu } from './pages/customer/CustomerMenu';
import { Login } from './pages/Login';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './ErrorBoundary';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FinanceManagement } from './pages/admin/FinanceManagement';
import { CameraManagement } from './pages/admin/CameraManagement';
import { InventoryManagement } from './pages/admin/InventoryManagement';
import { Settings } from './pages/admin/Settings';
import { KDS } from './pages/kds/KDS';
import { Reports } from './pages/admin/Reports';
import { DevicesManagement } from './pages/admin/DevicesManagement';
import { TablesManagement } from './pages/admin/TablesManagement';
import { KitchenManagement } from './pages/admin/KitchenManagement';
import { QRMenu } from './pages/admin/QRMenu';
import { Invoices } from './pages/admin/Invoices';
import { Purchases } from './pages/admin/Purchases';
import { Fiscalization } from './pages/admin/Fiscalization';
import { CashierTables } from './pages/cashier/CashierTables';
import { Customers } from './pages/cashier/Customers';
import { Reservations } from './pages/cashier/Reservations';
import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { CancelledOrders } from './pages/admin/CancelledOrders';
import { ShashlikManagement } from './pages/admin/ShashlikManagement';
import { StopListManagement } from './pages/cashier/StopListManagement';

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
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinValue, setPinValue] = useState('');
  
  if (!isSystemOpen && !isAdminRoute && !isCustomerRoute) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center font-sans">
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
              <h3 className="text-lg font-bold mb-4">Maxfiy kodni kiriting</h3>
              <input 
                type="text" 
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                autoFocus
                autoComplete="off"
                data-lpignore="true"
                style={{ WebkitTextSecurity: 'disc' } as any}
                className="w-full border rounded-lg p-2 mb-4 font-mono"
                placeholder="PIN kod"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const pin = pinValue;
                    if (pin) {
                      const cleanPin = pin.trim();
                      const normPin = cleanPin.replace(/\s+/g, '');
                      const isAdmin = cleanPin === '181992' || normPin === '181992' || cleanPin === '18 19 92';
                      if (isAdmin) {
                        useStore.getState().setSystemOpen(true);
                        setShowPinModal(false);
                        alert("Tizim muvaffaqiyatli ochildi!");
                      } else {
                        alert("Kod noto'g'ri yoki sizda yetarli huquq yo'q!");
                      }
                    }
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={() => {
                    const pin = pinValue;
                    if (pin) {
                      const cleanPin = pin.trim();
                      const normPin = cleanPin.replace(/\s+/g, '');
                      const isAdmin = cleanPin === '181992' || normPin === '181992' || cleanPin === '18 19 92';
                      if (isAdmin) {
                        useStore.getState().setSystemOpen(true);
                        setShowPinModal(false);
                        alert("Tizim muvaffaqiyatli ochildi!");
                      } else {
                        alert("Kod noto'g'ri yoki sizda yetarli huquq yo'q!");
                      }
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white p-10 rounded-3xl max-w-md text-center border border-slate-200 shadow-2xl">
          <div 
            onClick={() => {
              setPinValue('');
              setShowPinModal(true);
            }}
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-red-200 cursor-pointer hover:bg-red-200 transition-colors hover:scale-105 active:scale-95"
            title="Tizimni ishga tushirish"
          >
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

const DeviceRegistrationWrapper = ({ children }: { children: React.ReactNode }) => {
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
        <GlobalUI />
        <AnimatePresence mode="wait">
          {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
        </AnimatePresence>

        {!showSplash && (
          <BrowserRouter>
            <RemotePrintListener />
            <DeviceRegistrationWrapper>
              <SystemClosedWrapper>
                <Routes>
                {/* Auth Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><FinanceManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/tables" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><TablesManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/qr" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><QRMenu /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StaffManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><InventoryManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/shashlik" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><ShashlikManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Invoices /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/purchases" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Purchases /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/fiscal" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Fiscalization /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Settings /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/devices" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><DevicesManagement /></DashboardLayout></ProtectedRoute>} />
              
              {/* Other legacy admin routes that might be referenced but not in the main sidebar */}
              <Route path="/admin/kitchens" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><KitchenManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><MenuManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/stop-list" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StopListManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><OrdersManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/cancelled-orders" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><CancelledOrders /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Reports /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/cameras" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><CameraManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Customers /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/subscription" element={<Navigate to="/admin/reports" replace />} />
              <Route path="/admin/hr" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StaffManagement /></DashboardLayout></ProtectedRoute>} />

              {/* Cashier Routes */}
              <Route path="/cashier" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><CashierDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/cashier/stop-list" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><DashboardLayout role="cashier"><StopListManagement /></DashboardLayout></ProtectedRoute>} />
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

              <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/new-order" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><NewOrder /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/menu" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><MenuManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/settings" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><Settings role="waiter" /></DashboardLayout></ProtectedRoute>} />

              {/* Customer QR Routes */}
              <Route path="/menu/:tableId" element={<CustomerMenu />} />

              {/* Kitchen Routes */}
              <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['kitchen', 'admin']}><KitchenDashboard /></ProtectedRoute>} />

              {/* KDS Route */}
              <Route path="/kds/:department" element={<KDS />} />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              </SystemClosedWrapper>
            </DeviceRegistrationWrapper>
          </BrowserRouter>
        )}
      </>
    </ErrorBoundary>
  );
}

export default App;
