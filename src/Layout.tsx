import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { 
  LogOut, MessageSquare, LayoutDashboard, Gamepad2, Users, 
  Info, Bell, ShieldAlert, ChevronRight, ChevronLeft, Menu, X,
  Volume2, VolumeX, Home as HomeIcon, Book, AppWindow, ShoppingBag,
  Zap, ZapOff, Tv
} from 'lucide-react';
import { cn } from './lib/utils';
import Loader from './Loader';

export default function Layout({ children, activeSection, onSectionChange }: { 
  children: React.ReactNode, 
  activeSection: string,
  onSectionChange: (section: string) => void 
}) {
  const { user, logout, optimizationMode, setOptimizationMode } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isChangingSection, setIsChangingSection] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (!isMuted) {
        audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
      }
    }
  }, [isMuted]);

  // Auto-play on mount (if possible)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSectionChange = (section: string) => {
    setIsChangingSection(true);
    setTimeout(() => {
      onSectionChange(section);
      setIsMobileMenuOpen(false);
      setIsChangingSection(false);
    }, 800);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) audioRef.current.play().catch(() => {});
    }
  };

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: HomeIcon },
    { id: 'accounts', label: 'Cuentas', icon: LayoutDashboard },
    { id: 'streams', label: 'Transmisiones', icon: Tv },
    { id: 'chat', label: 'Chat Global', icon: MessageSquare },
    { id: 'games', label: 'Juegos', icon: Gamepad2 },
    { id: 'videogames', label: 'Videojuegos', icon: Gamepad2 },
    { id: 'novels', label: 'Novelas', icon: Book },
    { id: 'apps', label: 'Aplicaciones', icon: AppWindow },
    { id: 'store', label: 'Tienda', icon: ShoppingBag },
    { id: 'forums', label: 'Foros', icon: Users },
    { id: 'support', label: 'Soporte', icon: ShieldAlert },
    { id: 'info', label: 'Información', icon: Info },
    { id: 'ads', label: 'Anuncios', icon: Bell },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Panel Admin', icon: ShieldAlert });
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400';
      case 'plus': return 'text-cyan-400';
      case 'premium': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className={cn(
      "h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden relative flex flex-col",
      optimizationMode && "optimization-on"
    )}>
      <AnimatePresence>
        {isChangingSection && <Loader />}
      </AnimatePresence>

      {/* Background Image - Local file as requested */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {!optimizationMode && (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: 'url("/fondo.png")' }}
          />
        )}
        <div className={cn(
          "absolute inset-0 bg-slate-950/60",
          !optimizationMode && "backdrop-blur-[2px]"
        )} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden relative z-[60] flex-none flex items-center justify-between p-4 bg-[#0a0c14]/90 backdrop-blur-xl border-b border-red-900/20">
        <h1 className="text-xl font-black bg-gradient-to-r from-red-500 to-amber-600 bg-clip-text text-transparent uppercase tracking-widest">
          NEKO LTD
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className="p-2 text-slate-400">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/5 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden pt-0 lg:pt-0">
        {/* Sidebar - Desktop */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 280 : 80,
            x: 0
          }}
          className={cn(
            "hidden lg:flex bg-[#0a0c14]/95 backdrop-blur-xl border-r border-red-900/20 flex-col transition-all duration-300",
            !isSidebarOpen && "items-center"
          )}
        >
          <div className="p-6 flex items-center justify-between w-full">
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-black bg-gradient-to-r from-red-500 to-amber-600 bg-clip-text text-transparent uppercase tracking-widest"
              >
                NEKO LTD
              </motion.h1>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar w-full">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
                  activeSection === item.id 
                    ? "bg-red-600/20 text-red-400 border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]" 
                    : "hover:bg-white/5 text-slate-400 hover:text-slate-100"
                )}
              >
                <item.icon size={22} className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  activeSection === item.id && "text-red-400"
                )} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-red-900/20 w-full space-y-2">
            {/* Optimization Toggle */}
            <button
              onClick={() => setOptimizationMode(!optimizationMode)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
                optimizationMode 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                  : "hover:bg-white/5 text-slate-400 hover:text-slate-100"
              )}
              title={optimizationMode ? "Desactivar Optimización" : "Activar Optimización"}
            >
              {optimizationMode ? <ZapOff size={22} className="shrink-0" /> : <Zap size={22} className="shrink-0" />}
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium truncate"
                >
                  Optimización
                </motion.span>
              )}
            </button>

            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-red-950/30 border border-red-900/20",
              !isSidebarOpen && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg border border-red-500/30">
                {user?.name[0].toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{user?.name}</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", getRoleColor(user?.role || ''))}>
                    {user?.role} {user?.role === 'admin' && '👑'}
                  </p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-0 z-50 lg:hidden bg-[#05070a]/98 backdrop-blur-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 to-amber-600 bg-clip-text text-transparent uppercase tracking-widest">
                  NEKO LTD
                </h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 bg-white/5 rounded-lg border border-red-900/20">
                  <X size={20} className="text-red-400" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                      activeSection === item.id 
                        ? "bg-red-600/20 text-red-400 border border-red-600/30 shadow-[0_0_10px_rgba(220,38,38,0.1)]" 
                        : "bg-white/5 text-slate-400"
                    )}
                  >
                    <item.icon size={20} className={activeSection === item.id ? "text-red-400" : ""} />
                    <span className="font-bold text-base">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-red-900/20 flex flex-col gap-3">
                {/* Optimization Toggle Mobile - Smaller */}
                <button
                  onClick={() => setOptimizationMode(!optimizationMode)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all",
                    optimizationMode 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                      : "bg-white/5 text-slate-400"
                  )}
                >
                  {optimizationMode ? <ZapOff size={18} /> : <Zap size={18} />}
                  <span className="font-bold text-sm">Optimización {optimizationMode ? 'ON' : 'OFF'}</span>
                </button>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center font-bold text-lg border border-red-500/30">
                      {user?.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate max-w-[120px]">{user?.name}</p>
                      <p className={cn("text-[10px] font-bold uppercase", getRoleColor(user?.role || ''))}>{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar relative">
          {/* Mute Toggle - Desktop */}
          <button 
            onClick={toggleMute}
            className="hidden lg:flex fixed top-6 right-6 z-50 p-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <motion.div
            key={activeSection}
            initial={optimizationMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={optimizationMode ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-full mx-auto pb-6 min-h-full flex flex-col"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Background Music */}
      <audio 
        ref={audioRef}
        autoPlay 
        loop 
        muted={isMuted}
        src="/musica.mp3"
        onError={(e) => {
          // Fallback
          (e.target as HTMLAudioElement).src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }}
      />
    </div>
  );
}

