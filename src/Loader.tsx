import React from 'react';
import { motion } from 'motion/react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        
        {/* Inner Magic Circle */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-2 border-dashed border-purple-500/40 rounded-full flex items-center justify-center"
        >
          <div className="w-16 h-16 border border-cyan-400/30 rounded-full animate-pulse" />
        </motion.div>

        {/* Center Rune */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-4xl font-fantasy text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
            ᚛
          </span>
        </motion.div>
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 text-blue-400 font-fantasy tracking-[0.3em] uppercase text-sm animate-pulse"
      >
        Invocando el Reino...
      </motion.p>
    </div>
  );
}
