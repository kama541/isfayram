import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Monitor, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const DevicesManagement = () => {
  const { computerDevices } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'cashier' | 'waiter' | 'none'>('none');

  const handleApprove = async (deviceId: string) => {
    try {
      if (editRole === 'none') {
        alert("Iltimos, avval qurilma uchun rol tanlang! (Masalan: Kassir yoki Ofitsiant)");
        return;
      }
      
      const { error } = await supabase.from('computer_devices').update({
        computer_name: editName || 'Yangi Kompyuter',
        assigned_role: editRole,
        status: 'active',
        registered_at: new Date().toISOString()
      }).eq('id', deviceId);
      
      if (error) throw error;
      
      setEditingId(null);
      await useStore.getState().silentFetch();
    } catch (e: any) {
      alert("Xatolik: " + (e.message || JSON.stringify(e)));
    }
  };

  const handleDeactivate = async (deviceId: string) => {
    await supabase.from('computer_devices').update({ status: 'inactive' }).eq('id', deviceId);
    useStore.getState().silentFetch();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Monitor /> Kompyuterlar (Qurilmalar)</h1>
      <div className="grid gap-4">
        {computerDevices?.map(device => (
          <div key={device.id} className="bg-white p-5 rounded-2xl shadow border border-slate-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg">{device.computer_name || 'Nomsiz qurilma'}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${device.status === 'active' ? 'bg-green-100 text-green-700' : device.status === 'unregistered' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {device.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-mono">ID: {device.computer_id} | Rol: {device.assigned_role.toUpperCase()}</p>
              {device.last_seen_at && <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> Oxirgi marta: {new Date(device.last_seen_at).toLocaleString('uz-UZ')}</p>}
            </div>

            {editingId === device.id ? (
              <div className="flex items-center gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Kompyuter nomi" className="border p-2 rounded" />
                <select value={editRole} onChange={e => setEditRole(e.target.value as any)} className="border p-2 rounded">
                  <option value="none">Tanlang</option>
                  <option value="admin">Admin</option>
                  <option value="cashier">Kassir</option>
                  <option value="waiter">Ofitsiant</option>
                </select>
                <button onClick={() => handleApprove(device.id)} className="bg-green-500 text-white px-4 py-2 rounded font-bold">Saqlash</button>
                <button onClick={() => setEditingId(null)} className="bg-slate-200 px-4 py-2 rounded">Bekor</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {device.status !== 'active' && (
                  <button onClick={() => { setEditingId(device.id); setEditName(device.computer_name || ''); setEditRole(device.assigned_role); }} className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"><CheckCircle className="w-4 h-4"/> Tasdiqlash / Tahrir</button>
                )}
                {device.status === 'active' && (
                  <>
                    <button onClick={() => { setEditingId(device.id); setEditName(device.computer_name || ''); setEditRole(device.assigned_role); }} className="bg-slate-100 px-4 py-2 rounded-xl font-bold">Tahrirlash</button>
                    <button onClick={() => handleDeactivate(device.id)} className="flex items-center gap-1 bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold"><XCircle className="w-4 h-4"/> Faolsizlantirish</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {(!computerDevices || computerDevices.length === 0) && (
          <p className="text-slate-500">Hozircha ro'yxatdan o'tgan kompyuterlar yo'q.</p>
        )}
      </div>
    </div>
  );
};
