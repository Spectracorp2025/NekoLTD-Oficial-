import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { 
  LogOut, MessageSquare, LayoutDashboard, Gamepad2, Users, 
  Info, Bell, ShieldAlert, ChevronRight, ChevronLeft, Menu, X,
  Volume2, VolumeX, Home as HomeIcon, Book, AppWindow, ShoppingBag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Loader from './Loader';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children, activeSection, onSectionChange }: { 
  children: React.ReactNode, 
  activeSection: string,
  onSectionChange: (section: string) => void 
}) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isChangingSection, setIsChangingSection] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden relative">
      <AnimatePresence>
        {isChangingSection && <Loader />}
      </AnimatePresence>

      {/* Background Video - Local file as requested */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-40"
          src="/video.mp4"
          onError={(e) => {
            // Fallback if local file is missing
            (e.target as HTMLVideoElement).src = "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-mountain-range-11044-large.mp4";
          }}
        />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden relative z-[60] flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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

      <div className="relative z-10 flex h-screen pt-0 lg:pt-0">
        {/* Sidebar - Desktop */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 280 : 80,
            x: 0
          }}
          className={cn(
            "hidden lg:flex bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex-col transition-all duration-300",
            !isSidebarOpen && "items-center"
          )}
        >
          <div className="p-6 flex items-center justify-between w-full">
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
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
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "hover:bg-white/5 text-slate-400 hover:text-slate-100"
                )}
              >
                <item.icon size={22} className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  activeSection === item.id && "text-blue-400"
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

          <div className="p-4 border-t border-white/10 w-full">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-white/5",
              !isSidebarOpen && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
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
              className="fixed inset-0 z-50 lg:hidden bg-slate-950/95 backdrop-blur-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  NEKO LTD
                </h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                      activeSection === item.id 
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                        : "bg-white/5 text-slate-400"
                    )}
                  >
                    <item.icon size={24} />
                    <span className="font-bold text-lg">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl">
                    {user?.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{user?.name}</p>
                    <p className={cn("text-xs font-bold uppercase", getRoleColor(user?.role || ''))}>{user?.role}</p>
                  </div>
                </div>
                <button onClick={logout} className="p-3 bg-red-500/20 text-red-400 rounded-xl">
                  <LogOut size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          {/* Mute Toggle - Desktop */}
          <button 
            onClick={toggleMute}
            className="hidden lg:flex fixed top-6 right-6 z-50 p-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[100vw] mx-auto"
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

