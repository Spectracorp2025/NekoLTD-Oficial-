import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, User, MapPin, Calendar, Sparkles, ShieldCheck, Crown, ShoppingCart } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    phone: '',
    password: '',
    role: 'normal',
    code: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Handle WhatsApp redirect for registration code
    if (!isLogin && formData.role !== 'normal' && !formData.code) {
      const message = `Hola Administrador, solicito mi código de activación para registrarme en NEKO LTD.\nNombre: ${formData.name}\nEdad: ${formData.age}\nPaís: ${formData.country}\nTeléfono: ${formData.phone}\nRol solicitado: ${formData.role.toUpperCase()}`;
      window.open(`https://wa.me/573009555880?text=${encodeURIComponent(message)}`, '_blank');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text);
        throw new Error("El servidor devolvió una respuesta inesperada. Por favor, intenta de nuevo.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#05070a]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-main-background" />
        <div className="absolute inset-0 bg-[#05070a]/80 backdrop-blur-[2px]" />
      </div>

      {/* Character Stickers */}
      {!loading && (
        <>
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            src="https://picsum.photos/seed/sayori/400/600"
            className="fixed -bottom-20 -left-20 w-64 h-auto pointer-events-none z-0 grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            src="https://picsum.photos/seed/monika/400/600"
            className="fixed -bottom-20 -right-20 w-64 h-auto pointer-events-none z-0 grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Floating Hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
              animate={{ 
                opacity: [0, 0.4, 0], 
                y: -200,
                x: (Math.random() * 100 - 50) + (i * 20)
              }}
              transition={{ 
                duration: 4 + Math.random() * 4, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              className="fixed bottom-0 left-1/2 text-spectra-pink pointer-events-none z-0"
            >
              <Sparkles size={12 + Math.random() * 12} />
            </motion.div>
          ))}
        </>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Collaboration Badge - Moved outside to prevent clipping */}
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-[0_0_20px_rgba(255,183,197,0.3)]"
          >
            <span className="text-xs font-black text-spectra-pink uppercase tracking-widest">Spectra</span>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <span className="text-xs font-black text-spectra-blue uppercase tracking-widest">Doki Doki</span>
          </motion.div>
        </div>

        <div className="spectra-card p-5 md:p-8 !overflow-visible">
          <div className="text-center mb-6 md:mb-8 relative">
            {/* DDLC Logo Placeholder / Stylized Text */}
            <motion.div
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="mb-4 inline-block"
            >
              <div className="bg-spectra-pink text-white px-4 py-1 rounded-lg font-black text-xl shadow-[4px_4px_0px_#9575cd] transform -rotate-2">
                DOKI DOKI
              </div>
            </motion.div>
            
            <motion.h1 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl md:text-4xl font-black bg-gradient-to-r from-spectra-pink via-spectra-rose to-spectra-purple bg-clip-text text-transparent mb-1 drop-shadow-[0_0_15px_rgba(255,107,157,0.5)] uppercase tracking-widest"
          >
            SPECTRA
          </motion.h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium">{isLogin ? 'Bienvenido de vuelta' : 'Únete a nuestra comunidad'}</p>
        </div>


        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Nombre Completo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="number"
                    placeholder="Edad"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="País"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="text"
              placeholder="Número de Celular"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="password"
              placeholder="Contraseña"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal', icon: User, color: 'spectra-blue' },
                  { id: 'premium', label: 'Premium', icon: Sparkles, color: 'spectra-yellow' },
                  { id: 'plus', label: 'Plus', icon: Crown, color: 'spectra-pink' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({...formData, role: r.id as any})}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      formData.role === r.id 
                        ? `bg-${r.color}/20 border-${r.color} text-${r.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]` 
                        : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    <r.icon size={16} />
                    <span className="text-[10px] font-bold uppercase">{r.label}</span>
                  </button>
                ))}
              </div>

              {(formData.role === 'premium' || formData.role === 'plus') && (
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Código de Activación"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-spectra-pink"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                  <p className="text-[10px] text-spectra-pink mt-1 ml-1">
                    * Si no tienes código, dale a Registrarse para pedirlo por WhatsApp.
                  </p>
                </div>
              )}
            </>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-spectra-pink hover:bg-spectra-rose text-white font-bold py-3 rounded-xl shadow-lg shadow-spectra-pink/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Completar Registro')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
          </button>
        </div>
      </div>
    </motion.div>

      {/* Global Background Music */}
      <audio 
        autoPlay 
        loop 
        src="/musica.mp3"
        onCanPlay={(e) => {
          (e.target as HTMLAudioElement).play().catch(() => {});
        }}
        onError={(e) => {
          (e.target as HTMLAudioElement).src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }}
      />
    </div>
  );
}
