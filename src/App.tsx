import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Power, Monitor, XCircle } from 'lucide-react';
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
import { printReceiptElement } from './utils/printReceipt';

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
                type="password" 
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                autoFocus
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="PIN kod"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const pin = pinValue;
                    if (pin) {
                      const employees = useStore.getState().employees || [];
                      const isAdmin = pin === '111111' || pin === 'admin' || pin === '+998916769198' || pin === '916769198' || 
                                      employees.some(e => e.pinCode === pin && ((e.role as string) === 'admin' || e.fullName.toLowerCase().includes('admin')));
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
                      const employees = useStore.getState().employees || [];
                      const isAdmin = pin === '111111' || pin === 'admin' || pin === '+998916769198' || pin === '916769198' || 
                                      employees.some(e => e.pinCode === pin && ((e.role as string) === 'admin' || e.fullName.toLowerCase().includes('admin')));
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
  const { computerDevices, users, isLoading } = useStore();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [adminSetupMode, setAdminSetupMode] = useState(false);
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = 'PC-' + Math.random().toString(16).slice(2, 8).toUpperCase();
      localStorage.setItem('device_id', id);
    }
    setDeviceId(id);
    
    // Create unregistered record if it doesn't exist
    const checkAndRegister = async () => {
      try {
        const { data } = await supabase.from('computer_devices').select('*').eq('computer_id', id).single();
        if (!data) {
          await supabase.from('computer_devices').insert({ computer_id: id, status: 'unregistered', assigned_role: 'none' });
          useStore.getState().silentFetch();
        } else {
          await supabase.from('computer_devices').update({ last_seen_at: new Date().toISOString() }).eq('computer_id', id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkAndRegister();
  }, []);

  const device = computerDevices?.find(d => d.computer_id === deviceId);
  const hasAdmin = users?.some(u => u.role === 'admin') || computerDevices?.some(d => d.assigned_role === 'admin' && d.status === 'active');

  useEffect(() => {
    if (!isLoading) {
       setAdminSetupMode(!hasAdmin);
    }
  }, [isLoading, hasAdmin]);

  // Auto-login logic
  useEffect(() => {
    if (device && device.status === 'active' && device.assigned_role !== 'none') {
      if (sessionStorage.getItem('explicitLogout') === 'true') {
        return; // Skip auto-login if user explicitly logged out
      }
      const userStr = localStorage.getItem('currentUser');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      if (!currentUser || currentUser.role !== device.assigned_role) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: device.id, // we use device uuid as waiterId or cashierId
          fullName: device.computer_name || device.computer_id,
          role: device.assigned_role
        }));
        if (window.location.pathname === '/login' || window.location.pathname === '/') {
          window.location.href = `/${device.assigned_role}`;
        }
      }
    } else if (device && device.status !== 'active') {
      localStorage.removeItem('currentUser');
    }
  }, [device]);

  if (adminSetupMode && deviceId) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center font-sans text-white p-6">
        <Monitor className="w-16 h-16 mb-4 text-emerald-500" />
        <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest text-emerald-400">ISFAYRAM KAFE — Birinchi Admin sozlamasi</h1>
        <div className="bg-white/10 p-8 rounded-3xl border border-white/20 w-full max-w-md">
          <div className="mb-6 flex justify-between items-center bg-black/20 p-4 rounded-xl">
            <div>
              <p className="text-xs text-slate-400">Computer ID</p>
              <p className="font-mono font-bold text-lg">{deviceId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 text-right">Kompyuter nomi</p>
              <p className="font-bold text-lg text-emerald-400">Admin kompyuter</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Admin login</label>
              <input type="text" value={adminLogin} onChange={e => setAdminLogin(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Login" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Admin parol</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Parol" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Parolni tasdiqlash</label>
              <input type="password" value={adminPasswordConfirm} onChange={e => setAdminPasswordConfirm(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Parolni takrorlang" />
            </div>
            <button 
              onClick={async () => {
                if (!adminLogin || adminPassword.length < 6) return alert('Login va kamida 6 xonali parol kiriting');
                if (adminPassword !== adminPasswordConfirm) return alert('Parollar mos emas');
                
                try {
                  const sanitizedLogin = adminLogin.trim().toLowerCase();
                  const email = sanitizedLogin.includes('@') 
                    ? sanitizedLogin 
                    : `${sanitizedLogin.replace(/[^a-z0-9]/g, '') || 'admin'}@isfayram.com`;
                  
                  // 1. Supabase Auth user yaratish
                  const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password: adminPassword,
                  });
                  if (authError) throw new Error("Auth xatosi: " + authError.message);
                  if (!authData.user) throw new Error("Auth user yaratilmadi");

                  // 2. Admin profile yaratish
                  const { error: profileError } = await supabase.from('profiles').insert({
                    id: authData.user.id,
                    role: 'admin',
                    full_name: adminLogin
                  });
                  if (profileError) throw new Error("Profile xatosi: " + profileError.message);

                  // 3. Computer device yaratish / yangilash
                  const { data: existing } = await supabase.from('computer_devices').select('*').eq('computer_id', deviceId).single();
                  
                  if (existing) {
                    const { error: err1 } = await supabase.from('computer_devices').update({
                      computer_name: 'Admin kompyuter',
                      assigned_role: 'admin',
                      status: 'active',
                      registered_at: new Date().toISOString(),
                      registered_by: authData.user.id
                    }).eq('computer_id', deviceId);
                    if (err1) throw new Error("Device update xatosi: " + err1.message);
                  } else {
                    const { error: err2 } = await supabase.from('computer_devices').insert({
                      computer_id: deviceId,
                      computer_name: 'Admin kompyuter',
                      assigned_role: 'admin',
                      status: 'active',
                      registered_at: new Date().toISOString(),
                      registered_by: authData.user.id
                    });
                    if (err2) throw new Error("Device insert xatosi: " + err2.message);
                  }
                  
                  // 4. (Optional) Legacy PIN support
                  await supabase.from('employees').insert({
                    full_name: adminLogin,
                    role: 'admin',
                    pin_code: adminPassword,
                    is_active: true
                  });
                  
                  // 5. Muvaffaqiyatli yakun
                  await useStore.getState().silentFetch();
                  alert("Admin kompyuter muvaffaqiyatli ro'yxatdan o'tdi!");
                  window.location.reload();
                } catch (error: any) {
                  alert("Xatolik yuz berdi: " + (error.message || JSON.stringify(error)));
                }
              }}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Admin sifatida ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !deviceId || device === undefined) {
    return (
      <div className="fixed inset-0 z-50 bg-[#13120F] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (device.status === 'unregistered') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center font-sans text-white p-6">
        <Monitor className="w-20 h-20 mb-6 text-amber-500" />
        <h1 className="text-3xl font-bold mb-4">Bu kompyuter hali ro'yxatdan o'tmagan</h1>
        <p className="text-xl text-slate-300 mb-8">Admin tomonidan tasdiqlanishini kuting.</p>
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center min-w-[300px]">
          <p className="text-sm text-slate-400 mb-1">Computer ID</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{deviceId}</p>
          <div className="mt-4 inline-block bg-amber-500/20 text-amber-500 px-4 py-2 rounded-full font-bold">
            Holat: Ro'yxatdan o'tmagan
          </div>
        </div>
      </div>
    );
  }

  if (device.status === 'inactive') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center font-sans text-white p-6">
        <XCircle className="w-20 h-20 mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-4 text-center">Bu kompyuter Admin tomonidan faolsizlantirilgan.</h1>
        <p className="text-xl text-slate-300 mb-8">Iltimos adminga murojaat qiling.</p>
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center min-w-[300px]">
          <p className="text-sm text-slate-400 mb-1">Computer ID</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{deviceId}</p>
          <div className="mt-4 inline-block bg-red-500/20 text-red-500 px-4 py-2 rounded-full font-bold">
            Holat: Faolsiz
          </div>
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
              <Route path="/admin" element={<Navigate to="/admin/reports" replace />} />
              <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><FinanceManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/tables" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><TablesManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/qr" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><QRMenu /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StaffManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><InventoryManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Invoices /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/purchases" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Purchases /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/fiscal" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Fiscalization /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Settings /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/devices" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><DevicesManagement /></DashboardLayout></ProtectedRoute>} />
              
              {/* Other legacy admin routes that might be referenced but not in the main sidebar */}
              <Route path="/admin/kitchens" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><KitchenManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><MenuManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><OrdersManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Reports /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/cameras" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><CameraManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Customers /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/subscription" element={<Navigate to="/admin/reports" replace />} />
              <Route path="/admin/hr" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><StaffManagement /></DashboardLayout></ProtectedRoute>} />

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

              <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/new-order" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><NewOrder /></DashboardLayout></ProtectedRoute>} />
              <Route path="/waiter/menu" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><DashboardLayout role="waiter"><MenuManagement /></DashboardLayout></ProtectedRoute>} />

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
