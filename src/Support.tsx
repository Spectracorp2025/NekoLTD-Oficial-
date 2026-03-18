import { useAuth } from './AuthContext';
import { ShieldAlert, Send } from 'lucide-react';
import React, { useState } from 'react';

export default function Support() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = (e.target as any).elements[0].value;
    
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, message })
      });
      
      if (res.ok) {
        alert("Reporte enviado al administrador. Te contactaremos pronto.");
        setMessage('');
      } else {
        const data = await res.json();
        alert(data.error || "Error al enviar el reporte");
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert("Error de conexión al enviar el reporte");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Soporte y Reportes</h2>
          <p className="text-slate-400">¿Encontraste un error o tienes una sugerencia?</p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Tipo de Reporte</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50">
              <option>Error en la plataforma</option>
              <option>Sugerencia</option>
              <option>Reportar Usuario</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Mensaje</label>
            <textarea
              required
              rows={6}
              placeholder="Describe detalladamente el problema..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Send size={20} /> Enviar Reporte
          </button>
        </form>
      </div>
    </div>
  );
}
