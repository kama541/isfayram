import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Power, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Role } from '../../types';

interface SettingsProps {
  role?: Role;
}

export const Settings = ({ role = 'admin' }: SettingsProps) => {
  const navigate = useNavigate();
  const { isSystemOpen, setSystemOpen, theme, setTheme } = useStore();

  const handleToggleSystem = () => {
    (window as any).customConfirm(isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi. Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?", () => {
      setSystemOpen(!isSystemOpen);
    });
  };

  const [localReceipt, setLocalReceipt] = React.useState(useStore.getState().receiptSettings);
  const { updateReceiptSettings, receiptSettings } = useStore();

  React.useEffect(() => {
    setLocalReceipt(receiptSettings);
  }, [receiptSettings]);

  const handleSaveReceipt = () => {
    updateReceiptSettings(localReceipt);
    alert('Chek sozlamalari saqlandi!');
  };

  const [printers, setPrinters] = React.useState<any[]>([]);
  const [printerConfig, setPrinterConfig] = React.useState<Record<string, string>>({});
  const [stations, setStations] = React.useState<string[]>([]);
  const [localIp, setLocalIp] = React.useState<{ ip: string; port: string } | null>(null);

  React.useEffect(() => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron) {
      electronApi.getPrinters().then(setPrinters);
      electronApi.getPrinterConfig().then((cfg: any) => {
        setPrinterConfig(cfg);
        // stations normally from electron, but since we didn't expose getStations, 
        // we can just extract from config keys except __receipt_printer__ and __stations__
        const st = Object.keys(cfg).filter(k => k !== '__stations__' && k !== '__receipt_printer__');
        setStations(st);
      });
      if (electronApi.getLocalIp) {
        electronApi.getLocalIp().then(setLocalIp);
      }
    }
  }, []);

  const handleSavePrinters = async () => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron) {
      await electronApi.setPrinterConfig(printerConfig);
      alert('Printer sozlamalari saqlandi!');
    }
  };

  const handleTestPrint = () => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron) {
      electronApi.printReceiptHtml(`
        <div style="text-align:center; font-family:sans-serif; margin-top:20px;">
          <h3>Isfayram POS</h3>
          <p>Bu test chek.</p>
          <p>Printer muvaffaqiyatli ulandi!</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      `);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Profil</h2>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Foydalanuvchi</p>
                  <p className="text-sm text-slate-500 capitalize">{role}</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Tashqi Ko'rinish</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">Mavzu (Tema)</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tungi yoki kunduzgi rejimni tanlang</p>
                </div>
              </div>
              
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                {theme === 'dark' ? 'Kunduzgi' : 'Tungi'}
              </button>
            </div>
          </div>

          {role === 'admin' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Tizim holati (Xavfli zona)</h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${isSystemOpen ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{isSystemOpen ? "Tizim ochiq" : "Tizim yopilgan"}</p>
                    <p className="text-sm text-slate-500">Xodimlar uchun tizimga kirish holati</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleToggleSystem}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm ${isSystemOpen ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  {isSystemOpen ? "Tizimni yopish" : "Tizimni ochish"}
                </button>
              </div>
            </div>
          )}
        </div>

        {role === 'admin' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Chek Sozlamalari</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chek Sarlavhasi (Nomi)</label>
                <input 
                  type="text" 
                  value={localReceipt.title}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manzil</label>
                <input 
                  type="text" 
                  value={localReceipt.address}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pastki matn 1 (Masalan: Telefon)</label>
                <input 
                  type="text" 
                  value={localReceipt.footer1}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, footer1: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pastki matn 2 (Tashakkur)</label>
                <input 
                  type="text" 
                  value={localReceipt.footer2}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, footer2: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              
              <button 
                onClick={handleSaveReceipt}
                className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Saqlash
              </button>
            </div>
            
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white mt-8">Chek Ko'rinishi (Preview)</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex justify-center items-center bg-gray-50 dark:bg-slate-900">
               <div style={{ width: '58mm', backgroundColor: 'white', padding: '10px', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', color: 'black', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
                 <div style={{ textAlign: 'center' }}>
                   <img src="/logo.png" alt="logo" style={{ width: '30mm', display: 'block', margin: '0 auto 1mm' }} />
                   <div style={{ fontSize: '15px', fontWeight: 900 }}>{localReceipt.title || 'Isfayram Kafe'}</div>
                   <div style={{ fontSize: '12px' }}>{localReceipt.address || 'Quvasoy, UZ'}</div>
                 </div>
                 
                 <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }} />
                 <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Namuna ovqat</div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 x 15 000</span>
                    <span>15 000</span>
                 </div>
                 <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }} />

                 <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
                   <div>{localReceipt.footer1 || 'Доставка 95 034 31 15'}</div>
                   <div style={{ marginTop: '5px' }}>{localReceipt.footer2 || 'Спасибо за визит!'}</div>
                 </div>
               </div>
            </div>

            {(window as any).electronApi?.isElectron && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Printer sozlamalari</h2>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                  {localIp && (
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Ulanish manzili (IP)</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Telefon yoki planshetdan ulanish uchun quyidagi manzilni brauzerga yozing:
                      </p>
                      <div className="mt-2 text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-center">
                        http://{localIp.ip}:{localIp.port}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">💳 Kassir Cheki (To'lov/Schet)</label>
                      <select
                        value={printerConfig['__receipt_printer__'] || ''}
                        onChange={(e) => setPrinterConfig({ ...printerConfig, '__receipt_printer__': e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                      >
                        <option value="">Printer tanlang...</option>
                        {printers.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {stations.map(station => (
                      <div key={station}>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">🍳 {station} (Oshxona)</label>
                        <select
                          value={printerConfig[station] || ''}
                          onChange={(e) => setPrinterConfig({ ...printerConfig, [station]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                        >
                          <option value="">Printer tanlang...</option>
                          {printers.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={handleTestPrint}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold transition-colors"
                    >
                      Test chek chiqarish
                    </button>
                    <button 
                      onClick={handleSavePrinters}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                    >
                      Saqlash
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
