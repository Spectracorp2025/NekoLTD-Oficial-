import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ForumPost } from './types';
import { MessageCircle, ThumbsUp, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Forums() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    fetch('/api/forums', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPosts(data));
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
      const post = await res.json();
      setPosts([post, ...posts]);
      setShowNewPost(false);
      setNewPost({ title: '', content: '' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Foros de la Comunidad</h2>
          <p className="text-slate-400">Comparte tus historias y conocimientos</p>
        </div>
        <button 
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all hover:scale-105"
        >
          <Plus size={20} /> Nuevo Tema
        </button>
      </div>

      {showNewPost && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl"
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
                className="px-6 py-2 bg-blue-600 rounded-xl font-bold"
              >
                Publicar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-blue-500/30 transition-all group"
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
                  <ThumbsUp size={16} />
                  <span className="text-sm">0</span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 line-clamp-2">{post.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
