import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';

export default function Loader() {
  const { optimizationMode } = useAuth();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a1a]">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={optimizationMode ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-spectra-pink/20 border-t-spectra-pink rounded-full"
        />
        
        {/* Center Icon */}
        <motion.div
          initial={optimizationMode ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
          animate={optimizationMode ? {} : { scale: 1.1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 bg-spectra-pink rounded-lg rotate-45 shadow-[0_0_15px_rgba(255,183,197,0.6)]" />
        </motion.div>
      </div>
      
      {!optimizationMode && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-20 text-spectra-pink font-display font-black tracking-widest uppercase text-sm animate-pulse"
        >
          Cargando Spectra...
        </motion.p>
      )}
    </div>
  );
}
