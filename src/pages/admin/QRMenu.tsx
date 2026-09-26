import { QrCode } from 'lucide-react';
import { MenuManagement } from './MenuManagement';

export const QRMenu = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <QrCode className="w-6 h-6 text-emerald-500" /> QR Menyu va Taomlar
      </h1>
    </div>
    <MenuManagement />
  </div>
);
