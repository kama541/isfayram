import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Placeholders for other pages
const Placeholder = ({ title }: { title: string }) => <div className="p-8 text-2xl font-bold">{title} sahifasi - Tez kunda</div>;

function App() {
  const fetchInitialData = useStore(state => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>} />
        <Route path="/admin/menu" element={<DashboardLayout role="admin"><MenuManagement /></DashboardLayout>} />
        <Route path="/admin/orders" element={<DashboardLayout role="admin"><OrdersManagement /></DashboardLayout>} />
        <Route path="/admin/staff" element={<DashboardLayout role="admin"><StaffManagement /></DashboardLayout>} />
        <Route path="/admin/settings" element={<DashboardLayout role="admin"><Placeholder title="Sozlamalar" /></DashboardLayout>} />

        {/* Cashier Routes */}
        <Route path="/cashier" element={<DashboardLayout role="cashier"><CashierDashboard /></DashboardLayout>} />
        <Route path="/cashier/payments" element={<DashboardLayout role="cashier"><CashierDashboard /></DashboardLayout>} />
        <Route path="/cashier/orders" element={<DashboardLayout role="cashier"><OrdersManagement /></DashboardLayout>} />

        {/* Waiter Routes */}
        <Route path="/waiter" element={<DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout>} />
        <Route path="/waiter/new-order" element={<DashboardLayout role="waiter"><NewOrder /></DashboardLayout>} />
        <Route path="/waiter/tables" element={<DashboardLayout role="waiter"><WaiterDashboard /></DashboardLayout>} />

        {/* Customer QR Routes */}
        <Route path="/menu/:tableId" element={<CustomerMenu />} />

        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
