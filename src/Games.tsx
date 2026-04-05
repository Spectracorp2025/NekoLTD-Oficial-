import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Trophy, Star, Lock, Search, Key, Copy, Check } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Game {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  password?: string;
  allowed_roles: string[];
}

export default function Games() {
  const { user, token } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (allowedRoles: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user?.role || 'normal');
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlay = (game: Game) => {
    if (!canAccess(game.allowed_roles)) return;
    window.open(game.url, '_blank');
  };

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            ZONA DE JUEGOS
          </h2>
          <p className="text-slate-400">Solo los mejores desafíos para nuestros guerreros.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/10 w-full md:w-96">
          <Search className="text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar juego..."
            className="bg-transparent border-none outline-none flex-1 text-slate-100"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.02 }}
            className="group bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={game.thumbnail_url || `https://picsum.photos/seed/game${game.id}/800/450`} 
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              {!canAccess(game.allowed_roles) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="text-center">
                    <Lock size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-black uppercase text-slate-400">Bloqueado</p>
                    <p className="text-[10px] text-slate-500">Acceso restringido</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="text-sm font-bold">4.9/5</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                  <Gamepad2 size={20} />
                </div>
                <h3 className="text-xl font-bold">{game.title}</h3>
              </div>
              
              <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                {game.description}
              </p>

              {game.password && canAccess(game.allowed_roles) && (
                <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group/pass">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key size={14} className="text-purple-400 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-black uppercase text-slate-500 leading-none mb-1">Clave de descompresión</span>
                      <span className="text-sm font-mono text-slate-200 truncate">{game.password}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(game.password!, game.id)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-purple-400"
                    title="Copiar clave"
                  >
                    {copiedId === game.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1">
                  {game.allowed_roles?.map(role => (
                    <span key={role} className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {role}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePlay(game)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                    canAccess(game.allowed_roles)
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canAccess(game.allowed_roles) ? (
                    <>
                      <Trophy size={18} /> Jugar
                    </>
                  ) : (
                    'Bloqueado'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGames.length === 0 && !loading && (
        <div className="text-center py-20">
          <Gamepad2 size={64} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-2xl font-bold text-slate-500">No se encontraron juegos</h3>
          <p className="text-slate-600">Intenta con otro término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
