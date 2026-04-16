import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';
import { Sparkles, Shield, Zap, Crown } from 'lucide-react';
import { cn } from './lib/utils';

export default function Home() {
  const { user } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Crown className="text-spectra-pink" size={48} />;
      case 'plus': return <Zap className="text-spectra-blue" size={48} />;
      case 'premium': return <Star className="text-spectra-yellow" size={48} />;
      default: return <Shield className="text-slate-400" size={48} />;
    }
  };

  const Star = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 bg-gradient-to-r from-spectra-pink/20 to-spectra-blue/20 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-lg"
      >
        <div className="flex -space-x-2">
          <img src="https://picsum.photos/seed/monika/40/40" className="w-6 h-6 rounded-full border border-spectra-pink" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/sayori/40/40" className="w-6 h-6 rounded-full border border-spectra-blue" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">
          Evento Especial: <span className="text-spectra-pink">Spectra</span> x <span className="text-spectra-blue">Doki Doki</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-spectra-pink/20 blur-[100px] rounded-full" />
        <div className="relative z-10 p-6 bg-white/5 backdrop-blur-md rounded-full border border-white/10 animate-pulse-soft shadow-[0_0_30px_rgba(255,183,197,0.2)]">
          {getRoleIcon()}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 w-full"
      >
        <h1 className="text-3xl md:text-7xl font-black bg-gradient-to-r from-spectra-pink via-spectra-purple to-spectra-pink bg-clip-text text-transparent uppercase tracking-widest leading-tight">
          Bienvenido, <br className="md:hidden" /> {user?.name}
        </h1>
        <p className="text-base md:text-2xl text-slate-400 font-display tracking-widest uppercase px-4">
          Tu aventura en <span className="text-spectra-pink">Spectra</span> comienza ahora
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl px-2"
      >
        {[
          { label: 'Rango', value: user?.role, icon: Sparkles, color: 'text-spectra-pink' },
          { label: 'País', value: user?.country, icon: Shield, color: 'text-spectra-blue' },
          { label: 'Estado', value: user?.status, icon: Zap, color: 'text-spectra-yellow' },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "spectra-card p-4 md:p-6 flex flex-col items-center gap-1 md:gap-2",
            i === 2 && "col-span-2 md:col-span-1"
          )}>
            <stat.icon className={stat.color} size={16} />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{stat.label}</p>
            <p className="text-sm md:text-lg font-display font-black uppercase text-white truncate w-full">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12"
      >
        <p className="text-slate-500 text-sm italic">
          "Cada día es una oportunidad para escribir un nuevo poema en Spectra"
        </p>
      </motion.div>
    </div>
  );
}
