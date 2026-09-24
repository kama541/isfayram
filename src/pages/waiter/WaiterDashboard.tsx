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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ofitsiant Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Stollar holati va chaqiriqlar</p>
        </div>
        <Link 
          to="/waiter/new-order" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
        >
          Yangi Buyurtma
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TablesOverview />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Chaqiriqlar
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
            {pendingCalls.map(call => (
              <div key={call.id} className="bg-red-50 p-4 rounded-xl border border-red-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex justify-between items-center pl-2">
                  <div>
                    <h3 className="font-bold text-red-700">№{call.tableId.replace('t', '')}</h3>
                    <p className="text-xs font-medium text-red-600 mt-0.5">Ofitsiant chaqirmoqda!</p>
                  </div>
                  <button 
                    onClick={() => resolveWaiterCall(call.id)}
                    className="p-2 bg-white text-red-600 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingCalls.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-8">
                Yangi chaqiriqlar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
