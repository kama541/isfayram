import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Maximize2, MicOff, Mic, X, Wifi, WifiOff, Settings } from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  number: string;
  imageUrl: string;
}

const MOCK_CAMERAS: Camera[] = [
  { id: 'c1', name: 'Zal 1', location: 'Asosiy zal', isOnline: true, number: 'CAM-01', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' },
  { id: 'c2', name: 'Zal 2', location: 'VIP zal', isOnline: true, number: 'CAM-02', imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800' },
  { id: 'c3', name: 'Kassa', location: 'To\'lov burchagi', isOnline: true, number: 'CAM-03', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c4', name: 'Kirish', location: 'Asosiy eshik', isOnline: true, number: 'CAM-04', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
  { id: 'c5', name: 'Tashqi hudud', location: 'Ko\'cha', isOnline: false, number: 'CAM-05', imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&q=80&w=800' },
  { id: 'c6', name: 'Oshxona', location: 'Pishirish hududi', isOnline: true, number: 'CAM-06', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=800' },
  { id: 'c7', name: 'Ombor', location: 'Oziq-ovqat ombori', isOnline: true, number: 'CAM-07', imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80&w=800' },
  { id: 'c8', name: 'Ofis', location: 'Boshqaruv', isOnline: true, number: 'CAM-08', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800' },
];

export const CameraManagement = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsMuted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kameralar Tizimi</h1>
          <p className="text-slate-500 text-sm mt-1">Real vaqt rejimida restoranni kuzatish</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">Tizim Faol</span>
          </div>
          <div className="w-px h-4 bg-slate-200 mx-2" />
          <span className="text-sm font-mono text-slate-500">
            {currentTime.toLocaleTimeString('uz-UZ', { hour12: false })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_CAMERAS.map((camera) => (
          <motion.div
            layoutId={`camera-card-${camera.id}`}
            key={camera.id}
            onClick={() => setSelectedCamera(camera)}
            className="group relative bg-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:ring-2 hover:ring-blue-500/50 transition-all aspect-video border border-slate-800"
          >
            {/* Camera Feed Simulation */}
            <div className="absolute inset-0 bg-black">
              {camera.isOnline ? (
                <>
                  <img 
                    src={camera.imageUrl} 
                    alt={camera.name}
                    className="w-full h-full object-cover opacity-60 saturate-50 contrast-125"
                  />
                  {/* Fake scanline effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                  <WifiOff className="w-8 h-8" />
                  <span className="text-sm font-medium tracking-widest uppercase">Signal yo'q</span>
                </div>
              )}
            </div>

            {/* Top Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
              <div className="flex items-center gap-2">
                {camera.isOnline && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white tracking-wider">LIVE</span>
                  </div>
                )}
                <span className="text-xs font-mono text-white/90 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                  {camera.number}
                </span>
              </div>
              <div className="flex gap-2">
                {camera.isOnline && (
                  <button 
                    onClick={(e) => toggleMute(e, camera.id)}
                    className="p-1.5 bg-black/40 backdrop-blur-md rounded-md hover:bg-white/20 text-white/90 transition-colors border border-white/10"
                  >
                    {isMuted[camera.id] ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedCamera(camera); }}
                  className="p-1.5 bg-black/40 backdrop-blur-md rounded-md hover:bg-white/20 text-white/90 transition-colors border border-white/10 opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-slate-400" />
                {camera.name}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 ml-6">{camera.location}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Camera Modal */}
      <AnimatePresence>
        {selectedCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCamera(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={`camera-card-${selectedCamera.id}`}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 z-10 flex flex-col"
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {selectedCamera.isOnline ? (
                      <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30 backdrop-blur-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <span className="text-xs font-bold text-red-500 tracking-widest">LIVE REC</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <WifiOff className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 tracking-widest">OFFLINE</span>
                      </div>
                    )}
                    <span className="text-sm font-mono text-white/90 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                      {selectedCamera.number}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">{selectedCamera.name}</h2>
                    <p className="text-slate-300 font-medium drop-shadow-md flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {selectedCamera.location}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                  <div className="hidden sm:flex flex-col items-end gap-1 mr-4">
                    <span className="text-white font-mono text-lg font-medium drop-shadow-md">
                      {currentTime.toLocaleTimeString('uz-UZ', { hour12: false })}
                    </span>
                    <span className="text-slate-300 font-mono text-sm drop-shadow-md">
                      {currentTime.toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleMute({ stopPropagation: () => {} } as any, selectedCamera.id)}
                    className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-white/20 text-white transition-colors border border-white/10"
                  >
                    {isMuted[selectedCamera.id] ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-white/20 text-white transition-colors border border-white/10"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedCamera(null)}
                    className="p-3 bg-red-500/80 backdrop-blur-md rounded-xl hover:bg-red-500 text-white transition-colors border border-red-400/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Content */}
              <div className="flex-1 relative bg-slate-900">
                {selectedCamera.isOnline ? (
                  <>
                    <img 
                      src={selectedCamera.imageUrl} 
                      alt={selectedCamera.name}
                      className="w-full h-full object-cover saturate-50 contrast-[1.15]"
                    />
                    {/* Advanced Scanline/Noise effect for large view */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
                         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-4">
                    <WifiOff className="w-16 h-16" />
                    <div className="text-center">
                      <p className="text-xl font-medium uppercase tracking-widest">Kamera ulanmagan</p>
                      <p className="text-sm mt-2 text-slate-500">Tarmoqni tekshiring yoki sozlamalarni yangilang</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom Controls / Status Bar */}
              <div className="h-12 bg-black border-t border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    1080p 60fps
                  </span>
                  <span>BITRATE: 4.2 Mbps</span>
                  <span>CODEC: H.265</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5" /> 98%
                  </span>
                  <span>IP: 192.168.1.{selectedCamera.number.split('-')[1]}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
