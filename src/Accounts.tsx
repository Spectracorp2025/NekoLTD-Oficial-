import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Lock, Star, Zap, Search, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Account {
  id: number;
  title: string;
  description: string;
  details: string;
  allowed_roles: string[];
  expires_at?: string;
}

export default function Accounts() {
  const { user, token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta no válida del servidor");
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (allowedRoles: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user?.role || 'normal');
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-transparent">
            CUENTAS COMPARTIDAS
          </h2>
          <p className="text-slate-400">Acceso exclusivo a plataformas premium de Neko Ltd.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/10 w-full md:w-96">
          <Search className="text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar plataforma..."
            className="bg-transparent border-none outline-none flex-1 text-slate-100"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAccounts.map((acc) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border transition-all ${
              canAccess(acc.allowed_roles) 
                ? 'bg-slate-900/50 border-white/10 shadow-lg shadow-indigo-500/5' 
                : 'bg-slate-950/50 border-white/5 opacity-60 grayscale'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  canAccess(acc.allowed_roles) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{acc.title}</h3>
                  {acc.expires_at && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase mt-0.5">
                      <Clock size={10} />
                      Expira: {new Date(acc.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                {acc.allowed_roles?.map(role => (
                  <span key={role} className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {acc.description && (
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {acc.description}
              </p>
            )}

            {canAccess(acc.allowed_roles) ? (
              <div className="relative group">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-sm text-indigo-200 break-all pr-12">
                  {acc.details}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(acc.details)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                  title="Copiar credenciales"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-dashed border-white/10 text-slate-500">
                <Lock size={24} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Contenido Bloqueado</p>
                <p className="text-[10px] mt-1 text-center">No tienes los rangos necesarios para ver estas credenciales.</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-20">
          <LayoutDashboard size={64} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-2xl font-bold text-slate-500">No se encontraron cuentas</h3>
          <p className="text-slate-600">Intenta con otro término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
