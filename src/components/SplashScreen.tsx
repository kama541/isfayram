import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    // Total animation time is around 2.5s
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(37,99,235,0.4)] relative"
        >
          {/* Subtle pulse behind logo */}
          <motion.div 
            className="absolute inset-0 bg-blue-400 rounded-3xl -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <UtensilsCrossed className="w-12 h-12 relative z-10" />
        </motion.div>

        {/* Brand Name Animation */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="text-4xl font-bold text-white tracking-tight mb-2"
        >
          Isfaryam
        </motion.h1>
        
        {/* Subtitle Animation */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
          className="text-slate-400 text-sm uppercase tracking-widest font-medium"
        >
          Premium Restaurant System
        </motion.p>

        {/* Loading Line Animation */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1, ease: 'easeInOut' }}
          className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full mt-10"
        />
      </div>
    </motion.div>
  );
};
