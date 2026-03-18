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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover md:object-contain opacity-40"
          src="/video.mp4"
          onError={(e) => {
            (e.target as HTMLVideoElement).src = "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-mountain-range-11044-large.mp4";
          }}
        />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-blue-500/20"
      >
        <div className="text-center mb-8">
          <motion.h1 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            NEKO LTD
          </motion.h1>
          <p className="text-slate-400 font-medium">{isLogin ? 'Bienvenido de vuelta, viajero' : 'Únete a nuestra hermandad'}</p>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal', icon: User },
                  { id: 'premium', label: 'Premium', icon: Sparkles },
                  { id: 'plus', label: 'Plus', icon: Crown }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({...formData, role: r.id as any})}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      formData.role === r.id 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                  <p className="text-[10px] text-blue-400 mt-1 ml-1">
                    * Si no tienes código, dale a Registrarse para pedirlo por WhatsApp.
                  </p>
                </div>
              )}
            </>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Entrar al Reino' : 'Completar Registro')}
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
      </motion.div>

      {/* Global Background Music */}
      <audio 
        autoPlay 
        loop 
        src="/musica.mp3"
        onError={(e) => {
          (e.target as HTMLAudioElement).src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }}
      />
    </div>
  );
}
