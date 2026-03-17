import { Info, Server, User, Globe } from 'lucide-react';

export default function InfoSection() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
          <Info size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Información del Reino</h2>
          <p className="text-slate-400">Estado actual de Neko Ltd</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-green-400" size={20} />
            <h3 className="font-bold">Estado de Servidores</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Servidor Principal</span>
              <span className="text-green-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Base de Datos</span>
              <span className="text-green-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chat Real-time</span>
              <span className="text-green-400 font-bold">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-purple-400" size={20} />
            <h3 className="font-bold">Administración</h3>
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Fundador: <span className="text-slate-100 font-bold">Fumiko</span></p>
            <p className="text-slate-400 text-sm">Versión: <span className="text-slate-100 font-bold">2.5.0-Fantasy</span></p>
            <p className="text-slate-400 text-sm">Ubicación: <span className="text-slate-100 font-bold">Neko World</span></p>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-3xl text-center">
        <Globe className="mx-auto text-blue-400 mb-4" size={48} />
        <h3 className="text-2xl font-bold mb-2">Nuestra Misión</h3>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Proveer un espacio seguro y mágico para que todos los usuarios puedan compartir, jugar y crecer juntos en una comunidad unida por la fantasía.
        </p>
      </div>
    </div>
  );
}
