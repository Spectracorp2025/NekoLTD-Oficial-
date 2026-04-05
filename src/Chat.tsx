import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './types';
import { Send, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Chat() {
  const { user, token, optimizationMode } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta no válida del servidor");
      }
      return res.json();
    })
    .then(data => setMessages(data))
    .catch(err => console.error("Error fetching chat:", err));

    socketRef.current = io();

    socketRef.current.on('receive_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('message_deleted', (messageId: number) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    socketRef.current.on('chat_cleared', () => {
      setMessages([]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current?.emit('send_message', {
      userId: user?.id,
      message: newMessage
    });
    setNewMessage('');
  };

  const deleteMessage = (id: number) => {
    if (window.confirm('¿Eliminar este mensaje?')) {
      socketRef.current?.emit('delete_message', id);
    }
  };

  const reportMessage = async (msg: ChatMessage) => {
    const reason = window.prompt(`Reportar mensaje de ${msg.user_name}:`);
    if (reason) {
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            type: 'chat_report', 
            message: `Reporte de mensaje (ID: ${msg.id}): ${reason}`,
            target_id: msg.user_id
          })
        });
        alert('Reporte enviado');
      } catch (error) {
        console.error('Error reporting message:', error);
      }
    }
  };

  const clearChat = () => {
    if (user?.role === 'admin') {
      socketRef.current?.emit('clear_chat');
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'border-purple-500/50 bg-purple-900/20 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/30';
      case 'plus': return 'border-cyan-500/50 bg-cyan-900/20 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30';
      case 'premium': return 'border-yellow-500/50 bg-yellow-900/20 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.2)] ring-1 ring-yellow-500/30';
      default: return 'border-white/10 bg-white/5 text-slate-200';
    }
  };

  const getBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      case 'plus': return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
      case 'premium': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
      default: return 'bg-slate-600';
    }
  };

  const getAuraEffect = (role: string) => {
    if (optimizationMode) return null;
    if (role === 'plus') return (
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-400 animate-pulse" />
        <div className="absolute inset-0 opacity-30">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-300 rounded-full"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
    if (role === 'premium') return (
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 animate-pulse" />
        <div className="absolute inset-0 opacity-40">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
    if (role === 'admin') return (
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-purple-500/15 animate-pulse" />
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl opacity-40 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-purple-400 animate-pulse" />
        <div className="absolute inset-0 border border-purple-500/50 rounded-2xl animate-pulse shadow-[inset_0_0_15px_rgba(168,85,247,0.5)]" />
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-300"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: '8px'
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto flex-1 w-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-none">
        <h2 className="text-2xl md:text-3xl font-bold">Chat Global</h2>
        {user?.role === 'admin' && (
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors text-sm"
          >
            <Trash2 size={16} /> Vaciar Chat
          </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-3 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={optimizationMode ? { opacity: 1 } : { opacity: 0, scale: 0.9, x: msg.user_id === user?.id ? 20 : -20 }}
              animate={optimizationMode ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`group relative p-4 rounded-2xl border ${getRoleStyle(msg.user_role)} max-w-[85%] ${msg.user_id === user?.id ? 'self-end rounded-tr-none' : 'self-start rounded-tl-none'}`}
            >
              {getAuraEffect(msg.user_role)}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-white ${getBadgeColor(msg.user_role)}`}>
                  {msg.user_role} {msg.user_role === 'admin' && '👑'}
                </span>
                <span className="font-bold text-sm">{msg.user_name}</span>
                <span className="text-[10px] opacity-50">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {msg.user_id !== user?.id && (
                  <button 
                    onClick={() => reportMessage(msg)}
                    className="p-1.5 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition-colors"
                    title="Reportar"
                  >
                    <AlertCircle size={14} />
                  </button>
                )}
                {(user?.role === 'admin' || msg.user_id === user?.id) && (
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
