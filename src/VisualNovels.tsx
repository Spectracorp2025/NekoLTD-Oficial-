import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronRight, Play, Lock, Eye } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Novel {
  id: number;
  title: string;
  description: string;
  cover_url: string;
  allowed_roles: string[];
}

interface Chapter {
  id: number;
  title: string;
  order_index: number;
  allowed_roles: string[];
}

interface ContentBlock {
  id: number;
  type: 'text' | 'dialogue' | 'thought' | 'video';
  content: string;
}

export default function VisualNovels() {
  const { user, token } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch('/api/novels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNovels(data);
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (novelId: number) => {
    try {
      const res = await fetch(`/api/novels/${novelId}/chapters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchContent = async (chapterId: number) => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const canAccess = (allowedRoles: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user?.role || 'normal');
  };

  if (selectedChapter) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <button 
          onClick={() => setSelectedChapter(null)}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
        >
          <ChevronRight className="rotate-180" size={20} /> Volver a Capítulos
        </button>

        <h2 className="text-3xl font-black text-white mb-8">{selectedChapter.title}</h2>

        <div className="space-y-6">
          {content.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              {block.type === 'video' ? (
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe 
                    src={block.content.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : block.type === 'dialogue' ? (
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-lg font-bold text-blue-400 mb-1">Personaje</p>
                  <p className="text-slate-200 italic">"{block.content}"</p>
                </div>
              ) : block.type === 'thought' ? (
                <div className="text-slate-400 italic">
                  <p>( {block.content} )</p>
                </div>
              ) : (
                <p className="text-slate-200 leading-relaxed text-lg">{block.content}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedNovel) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => setSelectedNovel(null)}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
        >
          <ChevronRight className="rotate-180" size={20} /> Volver a Novelas
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <img 
            src={selectedNovel.cover_url || "https://picsum.photos/seed/novel/400/600"} 
            alt={selectedNovel.title}
            className="w-full md:w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-white/10"
          />
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-white">{selectedNovel.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">{selectedNovel.description}</p>
            <div className="pt-4">
              <div className="flex flex-wrap gap-2">
                {selectedNovel.allowed_roles?.map(role => (
                  <span key={role} className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Capítulos</h3>
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              disabled={!canAccess(chapter.allowed_roles)}
              onClick={() => {
                setSelectedChapter(chapter);
                fetchContent(chapter.id);
              }}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${
                canAccess(chapter.allowed_roles)
                  ? 'bg-slate-900/50 border-white/10 hover:border-blue-500/50 hover:bg-slate-800/50'
                  : 'bg-slate-950/50 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  {chapter.order_index}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl font-bold">{chapter.title}</span>
                  <div className="flex gap-1 mt-1">
                    {chapter.allowed_roles?.map(role => (
                      <span key={role} className="text-[8px] uppercase font-bold text-slate-500">{role}</span>
                    ))}
                  </div>
                </div>
              </div>
              {canAccess(chapter.allowed_roles) ? <Play size={20} className="text-blue-400" /> : <Lock size={20} className="text-slate-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            NOVELAS VISUALES
          </h2>
          <p className="text-slate-400">Historias inmersivas y aventuras mágicas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {novels.map((novel) => (
          <motion.div
            key={novel.id}
            whileHover={{ y: -10 }}
            className="group relative bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="aspect-[2/3] relative">
              <img 
                src={novel.cover_url || "https://picsum.photos/seed/novel/400/600"} 
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              
              {!canAccess(novel.allowed_roles) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                  <div className="text-center">
                    <Lock size={40} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold uppercase text-slate-400">Bloqueado</p>
                    <p className="text-[10px] text-slate-500">Acceso restringido</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 truncate">{novel.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{novel.description}</p>
              
              <button
                disabled={!canAccess(novel.allowed_roles)}
                onClick={() => {
                  setSelectedNovel(novel);
                  fetchChapters(novel.id);
                }}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  canAccess(novel.allowed_roles)
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canAccess(novel.allowed_roles) ? (
                  <>
                    <Eye size={18} /> Leer Ahora
                  </>
                ) : (
                  'Sin Acceso'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
