import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, Moon, Sun, Printer, Check, Smartphone, Globe, Cloud, Laptop, RefreshCw, Database, Server, Monitor, UtensilsCrossed, ShoppingCart, Wifi, User, ShieldCheck, ChefHat, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getStationMode, setStationMode } from '../../utils/autoPrint';
import type { StationMode } from '../../utils/autoPrint';
import { useStore } from '../../store/useStore';
import type { Role, ReceiptSettings } from '../../types';
import { triggerReceiptPrint } from '../../utils/printReceipt';
import logoImg from '../../assets/logo.png';

interface SettingsProps {
  role?: Role;
}

export const Settings = ({ role = 'admin' }: SettingsProps) => {
  const navigate = useNavigate();
  const { isSystemOpen, setSystemOpen, theme, setTheme, updateReceiptSettings, receiptSettings, kitchenStations, employees } = useStore();

  const [localReceipt, setLocalReceipt] = useState<ReceiptSettings>({
    title: 'ISFAYRAM KAFE',
    address: 'Quvasoy, UZ',
    footer1: 'Доставка: +998 95 034 31 15   +998 93 229 88 96',
    footer2: 'Спасибо за визит!',
    paperWidth: '80mm',
    printerName: '',
    autoPrintOnPayment: false,
    ...receiptSettings
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [hostedUrlInput, setHostedUrlInput] = useState('');
  const [syncSavedNotice, setSyncSavedNotice] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const isElectron = typeof window !== 'undefined' && Boolean((window as any).electronApi?.isElectron);

  useEffect(() => {
    if (receiptSettings) {
      setLocalReceipt(prev => ({ ...prev, ...receiptSettings }));
    }
  }, [receiptSettings]);

  const [printers, setPrinters] = useState<any[]>([]);
  const [printerConfig, setPrinterConfig] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('stationPrinters') || '{}');
    } catch {
      return {};
    }
  });
  const [localIp, setLocalIp] = useState<{ ip: string; port: string } | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({}); 

  // Operating role configuration (Administrator, Kassir, Ofitsiant, Oshxona)
  const [operatingRole, setOperatingRole] = useState<string>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role) return u.role;
      } catch {}
    }
    return role || 'waiter';
  });

  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        return u.id || '';
      } catch {}
    }
    return '';
  });

  const [roleSavedNotice, setRoleSavedNotice] = useState(false);

  const handleSaveOperatingRole = (targetRole: string, targetStaffId?: string) => {
    setOperatingRole(targetRole);
    const staffId = targetStaffId !== undefined ? targetStaffId : selectedStaffId;

    let matched = employees.find(e => e.id === staffId);
    if (!matched) {
      matched = employees.find(e => e.role === targetRole && e.isActive);
    }

    if (matched) {
      localStorage.setItem('currentUser', JSON.stringify(matched));
      setSelectedStaffId(matched.id);
    } else {
      const current = localStorage.getItem('currentUser');
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem('currentUser', JSON.stringify({
        ...parsed,
        role: targetRole,
        fullName: targetRole === 'admin' ? 'Administrator' : targetRole === 'cashier' ? 'Kassir' : targetRole === 'kitchen' ? 'Oshxona' : 'Ofitsiant'
      }));
    }

    localStorage.setItem('deviceAssignedRole', targetRole);

    // Auto-adjust station printer mode for role
    if (targetRole === 'waiter' && deviceStationMode === 'on') {
      setStationMode('off');
      setDeviceStationMode('off');
    } else if (targetRole === 'cashier' && deviceStationMode === 'off') {
      setStationMode('on');
      setDeviceStationMode('on');
    }

    setRoleSavedNotice(true);
    setTimeout(() => setRoleSavedNotice(false), 2500);
  };

  const handleSwitchToRole = (targetRole: string) => {
    handleSaveOperatingRole(targetRole);
    if (targetRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (targetRole === 'cashier') {
      navigate('/cashier');
    } else if (targetRole === 'kitchen') {
      navigate('/cashier/kitchen');
    } else {
      navigate('/waiter');
    }
  };

  // Device role (printer station mode)
  const [deviceStationMode, setDeviceStationMode] = useState<StationMode>(() => getStationMode());

  const handleDeviceModeChange = (mode: StationMode) => {
    setStationMode(mode);
    setDeviceStationMode(mode);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleTestStationPrinter = async (stationKey: string, printerValue: string) => {
    const target = printerValue.trim() || localReceipt.printerName || 'default';
    setTestingKey(stationKey);
    const api = (window as any).electronApi;
    if (api?.testPrinter) {
      try {
        const res = await api.testPrinter(target);
        setTestResults(prev => ({
          ...prev,
          [stationKey]: {
            success: res.success,
            message: res.success ? (res.message || 'Printer tayyor!') : (res.error || "Ulanib bo'lmadi")
          }
        }));
      } catch (err: any) {
        setTestResults(prev => ({
          ...prev,
          [stationKey]: { success: false, message: err.message || 'Xatolik yuz berdi' }
        }));
      } finally {
        setTestingKey(null);
      }
    } else {
      setTestResults(prev => ({
        ...prev,
        [stationKey]: { success: true, message: 'Brauzer rejimi (Electron POS dasturida real printerga chop etiladi)' }
      }));
      setTestingKey(null);
    }
  };

  const [cashierStationIp, setCashierStationIp] = useState<string>('');

  useEffect(() => {
    // 1. Fetch remote printer configurations and cashier IP from Supabase
    supabase.from('settings').select('*').in('key', ['station_printers', 'cashier_station_ip']).then(({ data }) => {
      if (data) {
        const stationRow = data.find(r => r.key === 'station_printers');
        if (stationRow?.value) {
          try {
            const parsed = JSON.parse(stationRow.value);
            setPrinterConfig(prev => ({ ...parsed, ...prev }));
          } catch (e) {}
        }
        const ipRow = data.find(r => r.key === 'cashier_station_ip');
        if (ipRow?.value) {
          setCashierStationIp(ipRow.value);
        }
      }
    });

    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron) {
      electronApi.getPrinters().then((list: any[]) => {
        const foundList = list || [];
        setPrinters(foundList);
        if (foundList.length > 0) {
          setPrinterConfig(prev => {
            const updated = { ...prev };
            const defaultPrinter = foundList.find(p => p.isDefault)?.name || foundList[0]?.name;

            const stations = [
              { key: '🔥 Shashlik Room', keywords: ['shashlik', 'mangal', 'kabob'] },
              { key: '🐟 Fish Room', keywords: ['fish', 'baliq', 'sazan'] },
              { key: '🫓 Tandir', keywords: ['tandir', 'somsa', 'non'] },
              { key: '🥤 Bar', keywords: ['bar', 'ichimlik', 'choy'] }
            ];

            stations.forEach(st => {
              if (!updated[st.key]) {
                const matched = foundList.find(p => st.keywords.some(k => p.name.toLowerCase().includes(k)));
                if (matched) {
                  updated[st.key] = matched.name;
                }
              }
            });

            // Auto-detect cashier printer if empty
            setLocalReceipt(r => {
              if (!r.printerName) {
                const kassaMatched = foundList.find(p => ['kassa', 'pos', 'receipt', 'check'].some(k => p.name.toLowerCase().includes(k))) || defaultPrinter;
                if (kassaMatched) {
                  return { ...r, printerName: typeof kassaMatched === 'string' ? kassaMatched : kassaMatched.name };
                }
              }
              return r;
            });

            return updated;
          });
        }
      });
      electronApi.getPrinterConfig().then((cfg: any) => {
        if (cfg && Object.keys(cfg).length > 0) {
          setPrinterConfig(prev => ({ ...prev, ...cfg }));
        }
      });
      if (electronApi.getLocalIp) {
        electronApi.getLocalIp().then((res: any) => {
          setLocalIp(res);
          // If this machine is the cashier/admin station, register its IP in Supabase
          if (res?.ip && res.ip !== 'Topilmadi') {
            const ipStr = `http://${res.ip}:${res.port}`;
            setCashierStationIp(ipStr);
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            const isAdminOrCashier = Boolean(localStorage.getItem('adminUser')) || user?.role === 'cashier' || user?.role === 'admin';
            if (isAdminOrCashier) {
              supabase.from('settings').upsert({ key: 'cashier_station_ip', value: ipStr }, { onConflict: 'key' });
            }
          }
        });
      }
      if (electronApi.getHostedUrl) {
        electronApi.getHostedUrl().then((url: string) => {
          if (url) setHostedUrlInput(url);
        });
      }
    }
  }, []);

  const refreshPrinters = async () => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron && electronApi.getPrinters) {
      try {
        const list = await electronApi.getPrinters();
        setPrinters(list || []);
      } catch (e) {
        console.warn('Failed to refresh printers:', e);
      }
    }
  };

  const handleSaveAll = async () => {
    // 1. Save to state and localStorage
    await updateReceiptSettings(localReceipt);
    try {
      localStorage.setItem('receiptSettings', JSON.stringify(localReceipt));
      localStorage.setItem('stationPrinters', JSON.stringify(printerConfig));
    } catch (e) {}

    // 2. Save station_printers and receipt_service_percent to Supabase
    try {
      await supabase.from('settings').upsert([
        {
          key: 'station_printers',
          value: JSON.stringify(printerConfig)
        },
        {
          key: 'receipt_service_percent',
          value: String(localReceipt.serviceChargePercent ?? 10)
        }
      ], { onConflict: 'key' });
    } catch (e) {
      console.warn('Could not sync settings to Supabase:', e);
    }
    
    // 3. Save to Electron config
    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron && electronApi.setPrinterConfig) {
      const mergedConfig = {
        ...printerConfig,
        '__receipt_printer__': localReceipt.printerName || '',
        '__paper_width__': localReceipt.paperWidth || '80mm'
      };
      await electronApi.setPrinterConfig(mergedConfig);
      setPrinterConfig(mergedConfig);
    }
    
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleTestPrint = async () => {
    // 1. Immediately apply the current on-screen inputs so test print uses exact width and printer
    await updateReceiptSettings(localReceipt);
    try {
      localStorage.setItem('receiptSettings', JSON.stringify(localReceipt));
    } catch (e) {}

    const electronApi = (window as any).electronApi;
    if (electronApi?.isElectron && electronApi.setPrinterConfig) {
      const mergedConfig = {
        ...printerConfig,
        '__receipt_printer__': localReceipt.printerName || '',
        '__paper_width__': localReceipt.paperWidth || '80mm'
      };
      await electronApi.setPrinterConfig(mergedConfig);
      setPrinterConfig(mergedConfig);
    }

    const sampleTestOrder = {
      id: 'TEST-A060',
      tableId: 'test-table',
      waiterId: 'test-waiter',
      waiterName: 'NARGIZA',
      guestCount: 2,
      status: 'paid',
      paymentMethod: 'cash',
      totalAmount: 130000,
      createdAt: new Date().toISOString(),
      isTest: true,
      items: [
        { id: 'ti-1', orderId: 'TEST-A060', menuItemId: 'test-non', name: 'NON', quantity: 1, price: 5000, status: 'ready', kitchenRoom: '🫓 Tandir', categoryName: 'NON - CHOY' },
        { id: 'ti-2', orderId: 'TEST-A060', menuItemId: 'test-choy', name: 'CHOY', quantity: 3, price: 2000, status: 'ready', kitchenRoom: '🥤 Bar', categoryName: 'NON - CHOY' },
        { id: 'ti-3', orderId: 'TEST-A060', menuItemId: 'test-svejiy', name: 'SVEJIY', quantity: 1, price: 7000, status: 'ready', kitchenRoom: '🐟 Fish Room', categoryName: 'кухня' },
        { id: 'ti-4', orderId: 'TEST-A060', menuItemId: 'test-suzma', name: 'SUZMA', quantity: 2, price: 7000, status: 'ready', kitchenRoom: '🐟 Fish Room', categoryName: 'кухня' },
        { id: 'ti-5', orderId: 'TEST-A060', menuItemId: 'test-somsa', name: 'SOMSA MOL GOSHT', quantity: 4, price: 13000, status: 'ready', kitchenRoom: '🫓 Tandir', categoryName: 'кухня' },
        { id: 'ti-6', orderId: 'TEST-A060', menuItemId: 'test-tabaka', name: 'TABAKA 0.5', quantity: 1, price: 33000, status: 'ready', kitchenRoom: '🔥 Shashlik Room', categoryName: 'кухня' },
        { id: 'ti-7', orderId: 'TEST-A060', menuItemId: 'test-cola', name: 'COLA 1L', quantity: 1, price: 13000, status: 'ready', kitchenRoom: '🥤 Bar', categoryName: 'Бар' }
      ]
    };

    // Print Kassa check + ALL Kitchen Station tickets (🔥 Shashlik, 🐟 Fish, 🫓 Tandir, 🥤 Bar)
    window.dispatchEvent(new CustomEvent('app:print-all-stations-test', { detail: sampleTestOrder }));
  };

  const handleToggleSystem = () => {
    (window as any).customConfirm?.(
      isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi. Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?",
      () => setSystemOpen(!isSystemOpen)
    );
  };

  const handleSaveHostedUrl = async () => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.setHostedUrl) {
      await electronApi.setHostedUrl(hostedUrlInput.trim());
      setSyncSavedNotice(true);
      setTimeout(() => setSyncSavedNotice(false), 2500);
    }
  };

  const handleResetToLocal = async () => {
    const electronApi = (window as any).electronApi;
    if (electronApi?.setHostedUrl) {
      setHostedUrlInput('');
      await electronApi.setHostedUrl('');
      setSyncSavedNotice(true);
      setTimeout(() => setSyncSavedNotice(false), 2500);
    }
  };

  const handleReloadApp = async () => {
    const electronApi = (window as any).electronApi;
    setIsReloading(true);
    if (electronApi?.reloadApp) {
      await electronApi.reloadApp();
    } else {
      window.location.reload();
    }
  };

  const is58mm = localReceipt.paperWidth === '58mm';

  // Dedicated lightweight settings for waiters (Clean, only station mode role + connection + theme)
  if (role === 'waiter') {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6 font-sans">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              <Monitor className="w-6 h-6 text-amber-500" /> Ofitsiant Sozlamalari
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Qurilma roli va markaziy kassa ulanishi
            </p>
          </div>
          {isSavedNotice && (
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 animate-fade-in">
              <Check className="w-4 h-4" /> Saqlandi!
            </div>
          )}
        </div>

        {/* Qurilmaning Roli (Admin paneldagi kabi) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <Monitor className="w-5 h-5 text-amber-500" /> Bu Qurilmaning Roli
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ushbu qurilma qaysi vazifani bajarishini tanlang va saqlang:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                mode: 'off' as StationMode,
                icon: <UtensilsCrossed className="w-5 h-5" />,
                label: '🧑‍💼 Ofitsiant qurilmasi (Tavsiya etiladi)',
                desc: 'Ushbu telefon/planshet ofitsiant sifatida ishlaydi. Buyurtmalar oshxonaga va kassirga avtomatik uzatiladi, chek chiqarmaydi.'
              },
              {
                mode: 'on' as StationMode,
                icon: <ShoppingCart className="w-5 h-5" />,
                label: '💳 Kassir qurilmasi',
                desc: 'Ushbu qurilma kassa kompyuteri sifatida ishlaydi va to\'lov cheklarini printerdan chiqaradi.'
              },
              {
                mode: 'auto' as StationMode,
                icon: <Wifi className="w-5 h-5" />,
                label: '🔄 Avtomatik aniqlash',
                desc: 'Tizim qurilma turiga qarab o\'zi belgilaydi (Mobil telefon — ofitsiant, PC — kassir).'
              }
            ].map(opt => {
              const isActive = deviceStationMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => handleDeviceModeChange(opt.mode)}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-sm flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isActive && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                          ✓ Faol
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setStationMode(deviceStationMode);
                setIsSavedNotice(true);
                setTimeout(() => setIsSavedNotice(false), 2500);
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" /> Sozlamalarni saqlash
            </button>
          </div>
        </div>

        {/* Tarmoq & Markaziy Kassa Holati */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-white">
            <Wifi className="w-4 h-4 text-emerald-500" /> Markaziy Kassa Bog'lanishi
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ofitsiant buyurtmalari va chaqiriqlari avtomatik ravishda kassir kompyuteriga uzatiladi.
          </p>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Markaziy kassa:</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {cashierStationIp || 'Wi-Fi tarmog\'idan avtomatik bog\'langan'}
            </span>
          </div>
        </div>

        {/* Ranglar mavzusi */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Ranglar mavzusi</p>
              <p className="text-[11px] text-slate-500">{theme === 'dark' ? 'Tungi rejim' : 'Kunduzgi rejim'}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? 'Kunduzgiga o\'tish' : 'Tungiga o\'tish'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Printer className="w-7 h-7 text-amber-500" /> Sozlamalar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Printer, chek va tizim sozlamalari
          </p>
        </div>
        {isSavedNotice && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 animate-fade-in">
            <Check className="w-4 h-4" /> Saqlandi!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Printer & Receipt Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-500" /> Printer sozlamalari
              </h2>
              {cashierStationIp && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
                  <Wifi className="w-3.5 h-3.5" /> Kassa stansiyasi faol
                </span>
              )}
            </div>

            {/* Waiter Device Clarification Notice */}
            {role === 'waiter' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1.5">
                <div className="font-black text-sm flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" /> Ofitsiant Qurilmasi
                </div>
                <p className="leading-relaxed">
                  Ofitsiant qurilmasi jismoniy printerga to'g'ridan-to'g'ri ulanishi shart emas. Siz yangi buyurtma berganda yoki stol hisobini ("Schet") so'raganda, buyruq avtomatik ravishda <strong>Kassir notbuki</strong> va tegishli sex printerlariga (Shashlik, Baliq, Bar, Tandir) uzatiladi.
                </p>
                {cashierStationIp && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Markaziy kassa manzili: {cashierStationIp}
                  </p>
                )}
              </div>
            )}

            {/* Paper Width (58mm vs 80mm) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Chek kengligi
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLocalReceipt({ ...localReceipt, paperWidth: '80mm' })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    localReceipt.paperWidth === '80mm' || !localReceipt.paperWidth
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg font-black">80 mm</span>
                  <span className="text-xs font-medium opacity-80 mt-1">Standart keng qog'oz (72mm print)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalReceipt({ ...localReceipt, paperWidth: '58mm' })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    localReceipt.paperWidth === '58mm'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg font-black">58 mm</span>
                  <span className="text-xs font-medium opacity-80 mt-1">Ixcham qog'oz (48mm print)</span>
                </button>
              </div>
            </div>

            {/* Printer Device Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Asosiy Chek Printeri (Kassir / Hisob)
                </label>
                {isElectron && (
                  <button
                    type="button"
                    onClick={refreshPrinters}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Yangilash
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  list="system-printers-list"
                  placeholder="Masalan: ocpp-m09 yoki XP-80C"
                  value={localReceipt.printerName || ''}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, printerName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <datalist id="system-printers-list">
                  {printers.map(p => (
                    <option key={p.name} value={p.name}>{p.name} {p.isDefault ? '(Standart)' : ''}</option>
                  ))}
                </datalist>
              </div>

              {printers.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center mt-2.5">
                  <span className="text-xs text-slate-400 font-medium">Topilgan printerlar:</span>
                  {printers.map(p => {
                    const isSelected = (localReceipt.printerName || '').trim().toLowerCase() === p.name.trim().toLowerCase();
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setLocalReceipt({ ...localReceipt, printerName: p.name })}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p.name} {p.isDefault ? '★' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Device Role Configuration */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                  <Monitor className="w-5 h-5 text-violet-500" /> Bu Qurilmaning Roli
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Har bir kompyuter/tablet qaysi vazifani bajarishini belgilang. Bunga qarab cheklar to'g'ri printerga boriladi.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {([
                  {
                    mode: 'on' as StationMode,
                    icon: <ShoppingCart className="w-5 h-5" />,
                    color: 'indigo',
                    label: '💳 Kassir qurilmasi',
                    desc: 'Bu kompyuterda kassir ishlaydi. To\'lov qabul qilinganda kassir cheki shu printerdan chiqadi.'
                  },
                  {
                    mode: 'off' as StationMode,
                    icon: <UtensilsCrossed className="w-5 h-5" />,
                    color: 'amber',
                    label: '🧑‍💼 Ofitsiant qurilmasi',
                    desc: 'Bu kompyuter yoki telefon ofitsiant sifatida ishlaydi. Buyruqlar oshxonaga uzatiladi, chek chiqarmaydi.'
                  },
                  {
                    mode: 'auto' as StationMode,
                    icon: <Wifi className="w-5 h-5" />,
                    color: 'emerald',
                    label: '🔄 Avtomatik (Tavsiya etiladi)',
                    desc: 'Tizim qurilma rolini avtomatik aniqlaydi: Electron POS yoki Kassir/Admin — chek chiqaradi; Ofitsiant telefoni — chiqarmaydi.'
                  }
                ] as Array<{mode: StationMode, icon: React.ReactNode, color: string, label: string, desc: string}>).map(opt => {
                  const isActive = deviceStationMode === opt.mode;
                  const colorMap: Record<string, string> = {
                    indigo: isActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                    amber: isActive ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300',
                    emerald: isActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300',
                  };
                  const textMap: Record<string, string> = {
                    indigo: isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400',
                    amber: isActive ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400',
                    emerald: isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400',
                  };
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => handleDeviceModeChange(opt.mode)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${colorMap[opt.color]}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${textMap[opt.color]}`}>{opt.icon}</div>
                      <div>
                        <div className={`font-extrabold text-sm ${textMap[opt.color]}`}>
                          {opt.label}
                          {isActive && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 font-bold">✓ Faol</span>}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kitchen Station Printers Configuration */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                    🍽️ Oshxona bo'limlari printerlari (Alohida cheklar)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Har bir bo'lim uchun Windows printerini tanlang yoki tarmoq IP-manzilini kiriting (masalan: <code className="font-mono bg-black/20 px-1 py-0.5 rounded text-amber-400">192.168.1.150:9100</code>).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {(kitchenStations.filter(s => s.isActive).length > 0
                  ? kitchenStations.filter(s => s.isActive).map(s => ({
                      key: s.name,
                      label: s.name,
                      desc: s.description || "Oshxona bo'limi"
                    }))
                  : [
                      { key: '🔥 Shashlik Room', label: '🔥 Shashlik xonasi', desc: 'Shashlik, kabob va mangal taomlari' },
                      { key: '🐟 Fish Room', label: '🐟 Baliq xonasi', desc: 'Sazan va barcha baliq taomlari' },
                      { key: '🫓 Tandir', label: '🫓 Tandir xonasi', desc: 'Tandir go\'shti, somsalar va issiq nonlar' },
                      { key: '🥤 Bar', label: '🥤 Bar', desc: 'Choy, sok va barcha salqin ichimliklar' }
                    ]
                ).map((st) => {
                  const currentValue = printerConfig[st.key] || '';
                  const isTesting = testingKey === st.key;
                  const result = testResults[st.key];
                  return (
                    <div 
                      key={st.key} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-3 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            {st.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{st.desc}</div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <input
                            type="text"
                            list="system-printers-list"
                            value={currentValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPrinterConfig(prev => ({ ...prev, [st.key]: val }));
                            }}
                            placeholder="Printer nomi yoki IP:port"
                            className="w-full sm:w-64 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                          />

                          <button
                            type="button"
                            onClick={() => handleTestStationPrinter(st.key, currentValue)}
                            disabled={isTesting}
                            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {isTesting ? 'Sinash...' : 'Test chek'}
                          </button>
                        </div>
                      </div>

                      {/* Quick-select printer badges for this station */}
                      {printers.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap items-center pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tanlash:</span>
                          {printers.map(p => {
                            const isSelected = (currentValue || '').trim().toLowerCase() === p.name.trim().toLowerCase();
                            return (
                              <button
                                key={p.name}
                                type="button"
                                onClick={() => setPrinterConfig(prev => ({ ...prev, [st.key]: p.name }))}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                }`}
                              >
                                {p.name} {p.isDefault ? '★' : ''}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {result && (
                        <div className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 ${
                          result.success 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                        }`}>
                          <span>{result.success ? '✓' : '✗'}</span>
                          <span>{result.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Receipt Text Configuration */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Chek Matnlari
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Sarlavha (Restoran nomi)
                </label>
                <input
                  type="text"
                  value={localReceipt.title}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Manzil
                </label>
                <input
                  type="text"
                  value={localReceipt.address}
                  onChange={(e) => setLocalReceipt({ ...localReceipt, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Telefon / Pastki matn 1
                  </label>
                  <input
                    type="text"
                    value={localReceipt.footer1}
                    onChange={(e) => setLocalReceipt({ ...localReceipt, footer1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Pastki matn 2 (Tilak)
                  </label>
                  <input
                    type="text"
                    value={localReceipt.footer2}
                    onChange={(e) => setLocalReceipt({ ...localReceipt, footer2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Xizmat ko'rsatish (Servis) foizi (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localReceipt.serviceChargePercent ?? 10}
                    onChange={(e) => setLocalReceipt({ ...localReceipt, serviceChargePercent: Number(e.target.value) || 0 })}
                    className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">% (Standart 10% servis)</span>
                </div>
              </div>
            </div>

            {/* Buttons: Test Print & Save */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleTestPrint}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4 text-amber-500" /> TEST PRINT (Kassa + Barcha Sexlar)
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <Check className="w-4 h-4" /> Sozlamalarni saqlash
              </button>
            </div>
          </div>

          {/* Network & Device Info (for mobile wait staff) */}
          {localIp && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" /> Mahalliy Tarmoq Ulanishi (Wi-Fi)
              </div>
              <p className="text-xs text-slate-400">
                Ofitsiant telefonlari va oshxona planshetlari orqali kassa dasturiga ulanish manzili:
              </p>
              <div className="text-xl font-mono font-bold text-amber-400 bg-black/40 p-3 rounded-xl text-center border border-amber-400/20">
                http://{localIp.ip}:{localIp.port}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Thermal Receipt Preview & System Controls */}
        <div className="space-y-6">
          {/* Live Thermal Receipt Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Termal Chek Ko'rinishi ({localReceipt.paperWidth || '80mm'})
              </h2>
              <span className="text-xs font-mono text-slate-400">Jonli namuna</span>
            </div>

            <div className="flex justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden">
              <div
                style={{
                  width: is58mm ? '48mm' : '72mm',
                  maxWidth: is58mm ? '48mm' : '72mm',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  padding: is58mm ? '8px 4px' : '12px 6px',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: is58mm ? '10px' : '11px',
                  lineHeight: '1.35',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  borderRadius: '4px'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: is58mm ? '12px' : '13px' }}>*** TO'LANDI ***</div>
                  <img src={logoImg} alt="logo" style={{ width: is58mm ? '20mm' : '26mm', margin: '4px auto', display: 'block', filter: 'grayscale(100%)' }} />
                  <div style={{ fontWeight: 900, fontSize: is58mm ? '13px' : '14px' }}>{localReceipt.title || 'ISFAYRAM KAFE'}</div>
                  <div style={{ fontSize: is58mm ? '9px' : '10px' }}>{localReceipt.address || 'Quvasoy, UZ'}</div>
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                <div style={{ fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Order No:</span><span>#0142</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Table/Cabin:</span><span>12-stol</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Waiter:</span><span>Aziz</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date:</span><span>08.10.2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Time:</span><span>22:45</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, textTransform: 'uppercase', fontSize: is58mm ? '9px' : '10px' }}>
                  <span style={{ flex: 1, textAlign: 'left' }}>ITEM</span>
                  <span style={{ width: is58mm ? '7mm' : '9mm', textAlign: 'center' }}>QTY</span>
                  <span style={{ width: is58mm ? '20mm' : '26mm', textAlign: 'right' }}>PRICE</span>
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                <div style={{ fontWeight: 700 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ flex: 1, paddingRight: '2px' }}>Shashlik</span>
                    <span style={{ width: is58mm ? '7mm' : '9mm', textAlign: 'center' }}>2</span>
                    <span style={{ width: is58mm ? '20mm' : '26mm', textAlign: 'right' }}>50 000 UZS</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ flex: 1, paddingRight: '2px' }}>Fish</span>
                    <span style={{ width: is58mm ? '7mm' : '9mm', textAlign: 'center' }}>1</span>
                    <span style={{ width: is58mm ? '20mm' : '26mm', textAlign: 'right' }}>70 000 UZS</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ flex: 1, paddingRight: '2px' }}>Coca-Cola</span>
                    <span style={{ width: is58mm ? '7mm' : '9mm', textAlign: 'center' }}>2</span>
                    <span style={{ width: is58mm ? '20mm' : '26mm', textAlign: 'right' }}>20 000 UZS</span>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: is58mm ? '12px' : '14px' }}>
                  <span>TOTAL:</span>
                  <span>140 000 UZS</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '4px' }}>
                  <span>Payment:</span>
                  <span>CASH</span>
                </div>

                <div style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: is58mm ? '9px' : '10px' }}>
                  <div>{localReceipt.title || 'ISFAYRAM KAFE'}</div>
                  <div style={{ marginTop: '2px', fontWeight: 900 }}>Доставка:</div>
                  <div style={{ fontWeight: 900, fontSize: is58mm ? '9.5px' : '11px' }}>+998 95 034 31 15</div>
                  <div style={{ fontWeight: 900, fontSize: is58mm ? '9.5px' : '11px' }}>+998 93 229 88 96</div>
                  <div style={{ marginTop: '2px', opacity: 0.8 }}>{localReceipt.footer2 || 'Спасибо за визит!'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Control & Appearance */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Tizim Rejimi & Tema</h2>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Ranglar mavzusi</p>
                  <p className="text-xs text-slate-500">{theme === 'dark' ? 'Tungi rejim faol' : 'Kunduzgi rejim faol'}</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
              >
                {theme === 'dark' ? 'Kunduzgiga o\'tish' : 'Tungiga o\'tish'}
              </button>
            </div>

            {role === 'admin' && (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isSystemOpen ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <Power className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {isSystemOpen ? "Tizim Ochiq" : "Tizim Yopilgan"}
                    </p>
                    <p className="text-xs text-slate-500">Xodimlar uchun POS tizim holati</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleSystem}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isSystemOpen
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {isSystemOpen ? "Tizimni yopish" : "Tizimni ochish"}
                </button>
              </div>
            )}
          </div>

          {/* Cloud & Desktop POS Synchronization */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Bulut & Desktop POS Sinxronizatsiyasi
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Supabase Realtime
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Mijoz platformasi:</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isElectron ? '🖥️ Windows Desktop POS (EXE)' : '🌐 Veb Brauzer (Hosted POS)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Yagona Baza (Single DB):</span>
                </div>
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[220px]">
                  dmccbojtmvdazfdnyduh.supabase.co
                </span>
              </div>

              {localIp && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Ofitsiantlar mobil ulanishi:</p>
                      <p className="text-[10px] text-slate-400">Bir xil Wi-Fi dagi telefonlar uchun</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg font-bold">
                    http://{localIp.ip}:{localIp.port}
                  </span>
                </div>
              )}

              {isElectron ? (
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-500" /> Hosted POS URL (Doimiy eng so'nggi yangilanishlar):
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                      Hosted POS manzilini kiritsangiz (masalan, Vercel domen), Desktop EXE har doim eng yangi veb-kodni to'g'ridan-to'g'ri yuklaydi va qayta kompilatsiya qilish shart bo'lmaydi. Internet uzilsa, o'zining tezyurar lokal zaxirasidan ishlaydi.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={hostedUrlInput}
                        onChange={(e) => setHostedUrlInput(e.target.value)}
                        placeholder="https://isfayram.vercel.app yoki bo'sh qoldiring"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleSaveHostedUrl}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Saqlash
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sky-100 dark:border-sky-900/30">
                    <button
                      onClick={handleResetToLocal}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                      Standart lokal zaxiraga qaytarish
                    </button>

                    <button
                      onClick={handleReloadApp}
                      disabled={isReloading}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                      {isReloading ? 'Yuklanmoqda...' : 'Ilovani yangilash (F5)'}
                    </button>
                  </div>

                  {syncSavedNotice && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
                      <Check className="w-3 h-3" /> Sozlamalar muvaffaqiyatli saqlandi!
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Veb sahifani yangilash</p>
                      <p className="text-[10px] text-slate-400">Eng so'nggi ma'lumotlarni qayta sinxronlash</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReloadApp}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Qayta yuklash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

