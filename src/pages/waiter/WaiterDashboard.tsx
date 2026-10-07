import { Bell, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import { TablesOverview } from '../../components/TablesOverview';

export const WaiterDashboard = () => {
  const { waiterCalls, resolveWaiterCall } = useStore();
  const pendingCalls = waiterCalls.filter(c => c.status === 'pending');

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>Ofitsiant Panel</h1>
          <p className="text-sm mt-1" style={{ color: '#8A8070' }}>Xonalar holati va chaqiriqlar</p>
        </div>
        <Link 
          to="/waiter/new-order" 
          className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-95"
          style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 16px rgba(212,175,55,0.2)' }}
        >
          + Yangi Buyurtma
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TablesOverview />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#D4AF37' }}>
            <Bell className="w-4 h-4" /> Chaqiriqlar
          </h2>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.12)' }}>
            {pendingCalls.map(call => (
              <div key={call.id} className="p-4 rounded-xl relative overflow-hidden" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl"></div>
                <div className="flex justify-between items-center pl-2">
                  <div>
                    <h3 className="font-bold" style={{ color: '#ef4444' }}>Stol №{call.tableId.replace('t', '')}</h3>
                    <p className="text-xs font-medium mt-0.5" style={{ color: '#f87171' }}>Ofitsiant chaqirmoqda!</p>
                  </div>
                  <button 
                    onClick={() => resolveWaiterCall(call.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: '#10b981' }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingCalls.length === 0 && (
              <div className="text-sm text-center py-6" style={{ color: '#6C6659' }}>
                Yangi chaqiriqlar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
