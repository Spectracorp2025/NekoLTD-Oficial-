import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppWindow, ExternalLink, Lock, Search, Download } from 'lucide-react';
import { useAuth } from './AuthContext';

interface App {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  allowed_roles: string[];
}

export default function Apps() {
  const { user, token } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/apps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApps(data);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (allowedRoles: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user?.role || 'normal');
  };

  const filteredApps = apps.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            APLICACIONES
          </h2>
          <p className="text-slate-400">Herramientas y utilidades exclusivas de Neko Ltd.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/10 w-full md:w-96">
          <Search className="text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar aplicación..."
            className="bg-transparent border-none outline-none flex-1 text-slate-100"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredApps.map((app) => (
          <motion.div
            key={app.id}
            whileHover={{ scale: 1.02 }}
            className="group bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={app.thumbnail_url || "https://picsum.photos/seed/app/800/450"} 
                alt={app.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              {!canAccess(app.allowed_roles) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="text-center">
                    <Lock size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-black uppercase text-slate-400">Bloqueado</p>
                    <p className="text-[10px] text-slate-500">Acceso restringido</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                  <AppWindow size={20} />
                </div>
                <h3 className="text-xl font-bold">{app.title}</h3>
              </div>
              
              <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                {app.description}
              </p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1">
                  {app.allowed_roles?.map(role => (
                    <span key={role} className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {role}
                    </span>
                  ))}
                </div>
                
                <a
                  href={canAccess(app.allowed_roles) ? app.url : '#'}
                  target={canAccess(app.allowed_roles) ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                    canAccess(app.allowed_roles)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  onClick={e => !canAccess(app.allowed_roles) && e.preventDefault()}
                >
                  {canAccess(app.allowed_roles) ? (
                    <>
                      <Download size={18} /> Obtener
                    </>
                  ) : (
                    'Bloqueado'
                  )}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredApps.length === 0 && !loading && (
        <div className="text-center py-20">
          <AppWindow size={64} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-2xl font-bold text-slate-500">No se encontraron aplicaciones</h3>
          <p className="text-slate-600">Intenta con otro término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
