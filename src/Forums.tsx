import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ForumPost } from './types';
import { MessageCircle, ThumbsUp, Plus, ArrowLeft, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Forums() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');

  const fetchPosts = () => {
    fetch('/api/forums', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPosts(data));
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/forums', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(newPost)
    });
    if (res.ok) {
      fetchPosts();
      setShowNewPost(false);
      setNewPost({ title: '', content: '' });
    }
  };

  const handleOpenPost = async (id: number) => {
    const res = await fetch(`/api/forums/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedPost(data);
    }
  };

  const handleLike = async (id: number) => {
    const res = await fetch(`/api/forums/${id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      if (selectedPost && selectedPost.id === id) {
        handleOpenPost(id);
      }
      fetchPosts();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`/api/forums/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ content: newComment })
    });
    if (res.ok) {
      const comment = await res.json();
      setSelectedPost({
        ...selectedPost,
        comments: [...(selectedPost.comments || []), comment]
      });
      setNewComment('');
      fetchPosts();
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este foro?')) return;
    
    const res = await fetch(`/api/admin/forums/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setSelectedPost(null);
      fetchPosts();
    }
  };

  if (selectedPost) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Volver a los foros
        </button>

        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedPost.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-bold text-slate-300">{selectedPost.user_name}</span>
                <span>•</span>
                <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
              </div>
            </div>
            {user?.role === 'admin' && (
              <button 
                onClick={() => handleDeletePost(selectedPost.id)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
            {selectedPost.content}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/5">
            <button 
              onClick={() => handleLike(selectedPost.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${selectedPost.user_liked ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              <ThumbsUp size={20} />
              <span className="font-bold">{selectedPost.like_count || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle size={20} />
              <span className="font-bold">{selectedPost.comments?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="text-blue-400" />
            Comentarios
          </h3>

          <form onSubmit={handleAddComment} className="relative">
            <textarea
              placeholder="Escribe un comentario..."
              className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <Send size={20} />
            </button>
          </form>

          <div className="space-y-4">
            {selectedPost.comments?.map((comment: any) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/5 p-4 rounded-2xl"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-400 text-sm">{comment.user_name}</span>
                  <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p className="text-slate-300">{comment.content}</p>
              </motion.div>
            ))}
            {(!selectedPost.comments || selectedPost.comments.length === 0) && (
              <p className="text-center text-slate-500 py-8">No hay comentarios todavía. ¡Sé el primero en debatir!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Foros de la Comunidad</h2>
          <p className="text-slate-400">Comparte tus historias y conocimientos</p>
        </div>
        <button 
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Nuevo Tema
        </button>
      </div>

      <AnimatePresence>
        {showNewPost && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl overflow-hidden"
          >
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input
                required
                type="text"
                placeholder="Título del tema"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
              />
              <textarea
                required
                placeholder="Contenido..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                >
                  Publicar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleOpenPost(post.id)}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-blue-500/30 transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{post.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-bold text-slate-300">{post.user_name}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  <span className="text-sm">{post.comment_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={16} className={post.user_liked ? 'text-blue-400 fill-blue-400' : ''} />
                  <span className="text-sm">{post.like_count || 0}</span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 line-clamp-2">{post.content}</p>
          </motion.div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500">No hay temas todavía. ¡Inicia una conversación!</p>
          </div>
        )}
      </div>
    </div>
  );
}
