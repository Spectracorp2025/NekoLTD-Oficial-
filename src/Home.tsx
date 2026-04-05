import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';
import { Sparkles, Shield, Zap, Crown } from 'lucide-react';
import { cn } from './lib/utils';

export default function Home() {
  const { user } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Crown className="text-amber-500" size={48} />;
      case 'plus': return <Zap className="text-red-500" size={48} />;
      case 'premium': return <Star className="text-amber-400" size={48} />;
      default: return <Shield className="text-red-600" size={48} />;
    }
  };

  const Star = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full" />
        <div className="relative z-10 p-6 bg-[#0a0c14]/60 backdrop-blur-md rounded-full border border-red-900/20 animate-float shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          {getRoleIcon()}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 w-full"
      >
        <h1 className="text-3xl md:text-7xl font-black bg-gradient-to-r from-red-600 via-amber-500 to-red-800 bg-clip-text text-transparent uppercase tracking-widest leading-tight">
          Bienvenido, <br className="md:hidden" /> {user?.name}
        </h1>
        <p className="text-base md:text-2xl text-slate-400 font-fantasy tracking-widest uppercase px-4">
          Tu aventura en <span className="text-red-500">Neko Ltd</span> comienza ahora
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl px-2"
      >
        {[
          { label: 'Rango', value: user?.role, icon: Sparkles },
          { label: 'País', value: user?.country, icon: Shield },
          { label: 'Estado', value: user?.status, icon: Zap },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "fantasy-card p-4 md:p-6 flex flex-col items-center gap-1 md:gap-2 border-red-900/30",
            i === 2 && "col-span-2 md:col-span-1"
          )}>
            <stat.icon className="text-red-500/50" size={16} />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{stat.label}</p>
            <p className="text-sm md:text-lg font-fantasy uppercase text-red-100 truncate w-full">{stat.value}</p>
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
          "Que la magia de Neko guíe tus pasos en este reino digital"
        </p>
      </motion.div>
    </div>
  );
}
