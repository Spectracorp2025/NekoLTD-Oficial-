import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BarChart3, Megaphone, ShieldAlert, Trash2, 
  UserMinus, UserPlus, CheckCircle, XCircle, MessageSquare,
  Search, Filter, Save, Plus, AlertTriangle, Trash, Gamepad2,
  AppWindow, Book, Key, Play, FileText, Video, AlertCircle, X, ShoppingCart
} from 'lucide-react';
import { useAuth } from './AuthContext';

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  status: string;
  country: string;
  age: number;
  created_at: string;
}

interface Report {
  id: number;
  user_id: number;
  reporter_name: string;
  target_id?: number;
  target_name?: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  plusUsers: number;
  bannedUsers: number;
  totalReports: number;
  pendingReports: number;
}

export default function AdminPanel() {
  const { user: currentUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [novels, setNovels] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: string, id?: number, label: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const [adForm, setAdForm] = useState({ title: '', content: '', media_url: '', media_type: 'image' });
  const [gameForm, setGameForm] = useState({ title: '', description: '', url: '', thumbnail_url: '', category: 'juegos', allowed_roles: ['normal', 'premium', 'plus', 'admin'] });
  const [appForm, setAppForm] = useState({ title: '', description: '', url: '', thumbnail_url: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] });
  const [accountForm, setAccountForm] = useState({ title: '', description: '', details: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] });
  const [novelForm, setNovelForm] = useState({ title: '', description: '', cover_url: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] });
  const [productForm, setProductForm] = useState({ title: '', description: '', price: '', image_url: '' });
  const [chapterForm, setChapterForm] = useState({ novel_id: 0, title: '', order_index: 1, allowed_roles: ['normal', 'premium', 'plus', 'admin'] });
  const [contentForm, setContentForm] = useState({ novel_id: 0, chapter_id: 0, type: 'text', content: '', order_index: 1 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const safeFetch = async (url: string) => {
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            throw new Error(data.error || `Error ${res.status} en ${url}`);
          }
          const text = await res.text();
          console.error(`Error response from ${url}:`, text);
          throw new Error(`Error ${res.status} en ${url} (Respuesta no JSON)`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Respuesta no válida de ${url} (No es JSON)`);
        }
        return await res.json();
      };

      if (activeTab === 'users') {
        const data = await safeFetch('/api/admin/users');
        setUsers(data);
      } else if (activeTab === 'reports') {
        const data = await safeFetch('/api/admin/reports');
        setReports(data);
      } else if (activeTab === 'stats') {
        const data = await safeFetch('/api/admin/stats');
        setStats(data);
      } else if (activeTab === 'publish' || activeTab === 'manage') {
        const [g, a, acc, n, adData, p] = await Promise.all([
          safeFetch('/api/games'),
          safeFetch('/api/apps'),
          safeFetch('/api/accounts'),
          safeFetch('/api/novels'),
          safeFetch('/api/ads'),
          safeFetch('/api/products')
        ]);
        setGames(g);
        setApps(a);
        setAccounts(acc);
        setNovels(n);
        setAds(adData);
        setProducts(p);
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      setError(error.message || 'Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchChapters = async () => {
      if (!token || contentForm.novel_id === 0) {
        setChapters([]);
        return;
      }
      try {
        const res = await fetch(`/api/novels/${contentForm.novel_id}/chapters`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setChapters(data);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };
    fetchChapters();
  }, [contentForm.novel_id, token]);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePublishAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-detect YouTube
    let finalAdForm = { ...adForm };
    if (adForm.media_url.includes('youtube.com') || adForm.media_url.includes('youtu.be')) {
      finalAdForm.media_type = 'video';
    }

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalAdForm)
      });
      if (res.ok) {
        setNotification({ message: 'Anuncio publicado con éxito', type: 'success' });
        setAdForm({ title: '', content: '', media_url: '', media_type: 'image' });
        fetchData();
      }
    } catch (error) {
      console.error('Error publishing ad:', error);
    }
  };

  const handlePublishGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(gameForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Juego publicado', type: 'success' });
        setGameForm({ title: '', description: '', url: '', thumbnail_url: '', category: 'juegos', allowed_roles: ['normal', 'premium', 'plus', 'admin'] }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(appForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Aplicación publicada', type: 'success' });
        setAppForm({ title: '', description: '', url: '', thumbnail_url: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(accountForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Cuenta publicada', type: 'success' });
        setAccountForm({ title: '', description: '', details: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(novelForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Novela creada', type: 'success' });
        setNovelForm({ title: '', description: '', cover_url: '', allowed_roles: ['normal', 'premium', 'plus', 'admin'] }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Producto publicado', type: 'success' });
        setProductForm({ title: '', description: '', price: '', image_url: '' }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleClearChat = async () => {
    try {
      const res = await fetch('/api/admin/chat/clear', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ message: 'Chat borrado con éxito', type: 'success' });
      } else {
        setNotification({ message: 'Error al borrar chat', type: 'error' });
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      setNotification({ message: 'Error de red al borrar chat', type: 'error' });
    }
    setConfirmAction(null);
  };

  const handlePublishChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/novels/${chapterForm.novel_id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(chapterForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Capítulo agregado', type: 'success' });
        setChapterForm({ ...chapterForm, title: '', order_index: chapterForm.order_index + 1 }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/chapters/${contentForm.chapter_id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(contentForm)
      });
      if (res.ok) { 
        setNotification({ message: 'Contenido agregado', type: 'success' });
        setContentForm({ ...contentForm, content: '', order_index: contentForm.order_index + 1 }); 
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteContent = async (type: string, id: number) => {
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ message: 'Eliminado con éxito', type: 'success' });
        fetchData();
      } else {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setNotification({ message: `Error al eliminar: ${data.error}`, type: 'error' });
      }
    } catch (error: any) {
      console.error('Error deleting content:', error);
      setNotification({ message: `Error de red: ${error.message}`, type: 'error' });
    }
    setConfirmAction(null);
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ message: 'Reporte resuelto', type: 'success' });
        fetchData();
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const toggleRole = (form: any, setForm: any, role: string) => {
    const roles = form.allowed_roles || [];
    if (roles.includes(role)) {
      setForm({ ...form, allowed_roles: roles.filter((r: string) => r !== role) });
    } else {
      setForm({ ...form, allowed_roles: [...roles, role] });
    }
  };

  const RoleSelector = ({ form, setForm }: any) => (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase">Rangos con Acceso:</p>
      <div className="flex flex-wrap gap-2">
        {['normal', 'premium', 'plus', 'admin'].map(role => (
          <button
            key={role}
            type="button"
            onClick={() => toggleRole(form, setForm, role)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition-all ${
              (form.allowed_roles || []).includes(role)
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            <AlertCircle size={20} />
            <p className="font-bold">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-50">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-white">
                <AlertTriangle className="text-yellow-500" />
                ¿Estás seguro?
              </h3>
              <p className="text-slate-400 mb-8">
                Esta acción no se puede deshacer. Vas a eliminar: <span className="text-white font-bold">{confirmAction.label}</span>
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (confirmAction.type === 'clear_chat') {
                      handleClearChat();
                    } else {
                      handleDeleteContent(confirmAction.type, confirmAction.id!);
                    }
                  }}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-600/20"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            CENTRO DE MANDO
          </h2>
          <p className="text-slate-400">Gestión avanzada de Neko Ltd.</p>
        </div>
        <div className="flex bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/10">
          {[
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
            { id: 'publish', label: 'Publicar', icon: Plus },
            { id: 'manage', label: 'Gestionar', icon: Save },
            { id: 'reports', label: 'Reportes', icon: ShieldAlert },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden md:inline font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 flex items-center justify-between">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-sm font-bold"
          >
            Reintentar
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
              <Search className="text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o teléfono..."
                className="bg-transparent border-none outline-none flex-1 text-slate-100"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.map(u => (
                <div key={u.id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-xl">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {u.name}
                        {u.status === 'banned' && <AlertTriangle size={16} className="text-red-500" />}
                      </h3>
                      <p className="text-slate-400 text-sm">{u.phone} • {u.country} • {u.age} años</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.role === 'admin' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                          u.role === 'plus' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' :
                          u.role === 'premium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                          'bg-slate-500/20 border-slate-500 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.status === 'active' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                        }`}>
                          {u.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      {['normal', 'premium', 'plus'].map(role => (
                        <button
                          key={role}
                          onClick={() => handleUpdateRole(u.id, role)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                            u.role === role ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-slate-500'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(u.id, u.status === 'active' ? 'banned' : 'active')}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                        u.status === 'active' 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'
                      }`}
                    >
                      {u.status === 'active' ? <UserMinus size={16} /> : <UserPlus size={16} />}
                      {u.status === 'active' ? 'Banear' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {stats && (
              <>
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center">
                  <Users className="mx-auto mb-4 text-blue-400" size={40} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Usuarios</p>
                  <h3 className="text-5xl font-black mt-2">{stats.totalUsers}</h3>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center">
                  <Sparkles className="mx-auto mb-4 text-yellow-400" size={40} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Premium / Plus</p>
                  <h3 className="text-5xl font-black mt-2">{stats.premiumUsers + stats.plusUsers}</h3>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center">
                  <ShieldAlert className="mx-auto mb-4 text-red-400" size={40} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Reportes Pendientes</p>
                  <h3 className="text-5xl font-black mt-2">{stats.pendingReports}</h3>
                </div>
              </>
            )}
            <div className="md:col-span-3 bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Acciones Críticas
              </h3>
              <button 
                onClick={() => setConfirmAction({ type: 'clear_chat', label: 'Todo el chat global' })}
                className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all flex items-center gap-3"
              >
                <Trash2 size={24} />
                LIMPIAR CHAT GLOBAL
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'publish' && (
          <motion.div
            key="publish"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Anuncio */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Megaphone className="text-blue-400" />
                Publicar Anuncio
              </h3>
              <form onSubmit={handlePublishAd} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Título del Anuncio"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                  value={adForm.title}
                  onChange={e => setAdForm({...adForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Contenido del mensaje..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-32"
                  value={adForm.content}
                  onChange={e => setAdForm({...adForm, content: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="URL de Imagen/Video (Opcional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                  value={adForm.media_url}
                  onChange={e => setAdForm({...adForm, media_url: e.target.value})}
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  PUBLICAR ANUNCIO
                </button>
              </form>
            </div>

            {/* Juego */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Gamepad2 className="text-purple-400" />
                Agregar Juego
              </h3>
              <form onSubmit={handlePublishGame} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nombre del Juego"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500"
                  value={gameForm.title}
                  onChange={e => setGameForm({...gameForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Descripción"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500"
                  value={gameForm.description}
                  onChange={e => setGameForm({...gameForm, description: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="URL del Juego (iframe)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500"
                  value={gameForm.url}
                  onChange={e => setGameForm({...gameForm, url: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="URL de Miniatura"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500"
                  value={gameForm.thumbnail_url}
                  onChange={e => setGameForm({...gameForm, thumbnail_url: e.target.value})}
                />
                <RoleSelector form={gameForm} setForm={setGameForm} />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  AGREGAR JUEGO
                </button>
              </form>
            </div>

            {/* App */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <AppWindow className="text-emerald-400" />
                Agregar Aplicación
              </h3>
              <form onSubmit={handlePublishApp} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nombre de la App"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={appForm.title}
                  onChange={e => setAppForm({...appForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Descripción"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={appForm.description}
                  onChange={e => setAppForm({...appForm, description: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="URL de Descarga/Acceso"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={appForm.url}
                  onChange={e => setAppForm({...appForm, url: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="URL de Miniatura"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={appForm.thumbnail_url}
                  onChange={e => setAppForm({...appForm, thumbnail_url: e.target.value})}
                />
                <RoleSelector form={appForm} setForm={setAppForm} />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  AGREGAR APP
                </button>
              </form>
            </div>

            {/* Cuenta */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Key className="text-yellow-400" />
                Agregar Cuenta
              </h3>
              <form onSubmit={handlePublishAccount} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Título de la Cuenta"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-yellow-500"
                  value={accountForm.title}
                  onChange={e => setAccountForm({...accountForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Descripción / Instrucciones"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-yellow-500"
                  value={accountForm.description}
                  onChange={e => setAccountForm({...accountForm, description: e.target.value})}
                />
                <textarea 
                  placeholder="Credenciales (Usuario:Password)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-yellow-500"
                  value={accountForm.details}
                  onChange={e => setAccountForm({...accountForm, details: e.target.value})}
                  required
                />
                <RoleSelector form={accountForm} setForm={setAccountForm} />
                <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  AGREGAR CUENTA
                </button>
              </form>
            </div>

            {/* Novela */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Book className="text-pink-400" />
                Nueva Novela Visual
              </h3>
              <form onSubmit={handlePublishNovel} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Título de la Novela"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={novelForm.title}
                  onChange={e => setNovelForm({...novelForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Sinopsis"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={novelForm.description}
                  onChange={e => setNovelForm({...novelForm, description: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="URL de Portada"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={novelForm.cover_url}
                  onChange={e => setNovelForm({...novelForm, cover_url: e.target.value})}
                />
                <RoleSelector form={novelForm} setForm={setNovelForm} />
                <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  CREAR NOVELA
                </button>
              </form>
            </div>

            {/* Capítulo */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Play className="text-pink-400" />
                Agregar Capítulo
              </h3>
              <form onSubmit={handlePublishChapter} className="space-y-4">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={chapterForm.novel_id}
                  onChange={e => setChapterForm({...chapterForm, novel_id: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar Novela</option>
                  {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Título del Capítulo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={chapterForm.title}
                  onChange={e => setChapterForm({...chapterForm, title: e.target.value})}
                  required
                />
                <input 
                  type="number" 
                  placeholder="Orden"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-pink-500"
                  value={chapterForm.order_index}
                  onChange={e => setChapterForm({...chapterForm, order_index: parseInt(e.target.value)})}
                  required
                />
                <RoleSelector form={chapterForm} setForm={setChapterForm} />
                <button type="submit" className="w-full bg-pink-600/50 hover:bg-pink-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Plus size={20} />
                  AGREGAR CAPÍTULO
                </button>
              </form>
            </div>

            {/* Contenido */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl lg:col-span-2">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <FileText className="text-blue-400" />
                Agregar Contenido a Capítulo
              </h3>
              <form onSubmit={handlePublishContent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                    value={contentForm.novel_id}
                    onChange={e => setContentForm({...contentForm, novel_id: parseInt(e.target.value), chapter_id: 0})}
                    required
                  >
                    <option value={0}>Seleccionar Novela</option>
                    {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                  </select>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                    value={contentForm.chapter_id}
                    onChange={e => setContentForm({...contentForm, chapter_id: parseInt(e.target.value)})}
                    required
                    disabled={contentForm.novel_id === 0}
                  >
                    <option value={0}>Seleccionar Capítulo</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                    value={contentForm.type}
                    onChange={e => setContentForm({...contentForm, type: e.target.value})}
                  >
                    <option value="text">Texto</option>
                    <option value="dialogue">Diálogo</option>
                    <option value="thought">Pensamiento</option>
                    <option value="video">Video (YouTube URL)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <textarea 
                      placeholder="Contenido..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-32"
                      value={contentForm.content}
                      onChange={e => setContentForm({...contentForm, content: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="number" 
                      placeholder="Orden"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
                      value={contentForm.order_index}
                      onChange={e => setContentForm({...contentForm, order_index: parseInt(e.target.value)})}
                      required
                    />
                    <button type="submit" className="w-full h-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                      <Plus size={20} />
                      AGREGAR
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Producto */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <ShoppingCart className="text-emerald-400" />
                Publicar Producto
              </h3>
              <form onSubmit={handlePublishProduct} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Título del Producto"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={productForm.title}
                  onChange={e => setProductForm({...productForm, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Descripción del producto"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={productForm.description}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                  required
                />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Precio ($)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={productForm.price}
                  onChange={e => setProductForm({...productForm, price: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="URL de Imagen"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500"
                  value={productForm.image_url}
                  onChange={e => setProductForm({...productForm, image_url: e.target.value})}
                  required
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <Plus size={20} />
                  PUBLICAR PRODUCTO
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'manage' && (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-400">
                <Megaphone size={20} /> Anuncios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map(ad => (
                  <div key={ad.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {ad.media_url && (
                        <img 
                          src={getYoutubeThumbnail(ad.media_url) || ad.media_url} 
                          className="w-12 h-12 rounded-lg object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      )}
                      <p className="font-bold text-sm truncate max-w-[150px]">{ad.title}</p>
                    </div>
                    <button onClick={() => setConfirmAction({ type: 'ads', id: ad.id, label: ad.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-purple-400">
                <Gamepad2 size={20} /> Juegos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map(g => (
                  <div key={g.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={getYoutubeThumbnail(g.thumbnail_url) || g.thumbnail_url} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-sm">{g.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{g.category}</p>
                      </div>
                    </div>
                    <button onClick={() => setConfirmAction({ type: 'games', id: g.id, label: g.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-emerald-400">
                <AppWindow size={20} /> Aplicaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map(a => (
                  <div key={a.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={getYoutubeThumbnail(a.thumbnail_url) || a.thumbnail_url} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <p className="font-bold text-sm">{a.title}</p>
                    </div>
                    <button onClick={() => setConfirmAction({ type: 'apps', id: a.id, label: a.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-yellow-400">
                <Key size={20} /> Cuentas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <p className="font-bold text-sm">{acc.title}</p>
                    <button onClick={() => setConfirmAction({ type: 'accounts', id: acc.id, label: acc.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-pink-400">
                <Book size={20} /> Novelas Visuales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {novels.map(n => (
                  <div key={n.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={n.cover_url} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <p className="font-bold text-sm">{n.title}</p>
                    </div>
                    <button onClick={() => setConfirmAction({ type: 'novels', id: n.id, label: n.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-emerald-400">
                <ShoppingCart size={20} /> Productos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-xs text-emerald-400 font-bold">${p.price}</p>
                      </div>
                    </div>
                    <button onClick={() => setConfirmAction({ type: 'products', id: p.id, label: p.title })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {reports.length === 0 ? (
              <div className="text-center p-12 bg-slate-900/50 rounded-3xl border border-white/10">
                <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold">¡Todo en orden!</h3>
                <p className="text-slate-400">No hay reportes pendientes por revisar.</p>
              </div>
            ) : reports.map(r => (
              <div key={r.id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black uppercase bg-red-500/20 text-red-400 px-2 py-1 rounded-lg border border-red-500/30">
                      REPORTE #{r.id}
                    </span>
                    <span className="text-slate-500 text-xs">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-100">
                    <span className="font-black text-blue-400">{r.reporter_name || 'Usuario'}</span> envió un reporte de tipo <span className="font-black text-purple-400">{r.type}</span>
                    {r.target_name && (
                      <> contra <span className="font-black text-red-400">{r.target_name}</span></>
                    )}
                  </p>
                  <p className="text-slate-400 mt-2 p-3 bg-white/5 rounded-xl italic">"{r.message}"</p>
                </div>
                  <div className="flex gap-2">
                    {r.status === 'pending' && (
                      <button 
                        onClick={() => handleResolveReport(r.id)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all"
                      >
                        Resolver
                      </button>
                    )}
                    <button 
                      onClick={() => setConfirmAction({ type: 'reports', id: r.id, label: `Reporte #${r.id}` })}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Sparkles = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const Crown = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
  </svg>
);
