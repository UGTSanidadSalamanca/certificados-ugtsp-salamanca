import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { dataStore } from '../lib/store';
import { Users, FileText, GraduationCap, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ actions: 0, participants: 0, certificates: 0, valid: 0 });

  useEffect(() => {
    async function load() {
      const [a, p, c] = await Promise.all([
        dataStore.getActions(),
        dataStore.getPeople(),
        dataStore.getCertificates()
      ]);
      setStats({
        actions: a.length,
        participants: p.length,
        certificates: c.length,
        valid: c.filter(x => x.status === 'válido').length
      });
    }
    load();
  }, []);

  const kpis = [
    { title: 'Acciones Formativas', value: stats.actions, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Participantes', value: stats.participants, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Certificados Emitidos', value: stats.certificates, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: 'Certificados Válidos', value: stats.valid, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full -m-8">
      <div className="p-8 flex-1 grid grid-cols-12 gap-6 overflow-y-auto">
        <div className="col-span-12 grid grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">Certificados Emitidos</p>
            <p className="text-2xl font-bold text-slate-900">{stats.certificates}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">Certificados Válidos</p>
            <p className="text-2xl font-bold text-slate-900">{stats.valid}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">Acciones Formativas</p>
            <p className="text-2xl font-bold text-slate-900">{stats.actions}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">Participantes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.participants}</p>
          </div>
        </div>

        <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Información Importante</h3>
          </div>
          <div className="p-6 text-sm text-slate-600 leading-relaxed">
            <p className="mb-4">
              Este sistema es responsable de la gestión y mantenimiento de las certificaciones formativas internas de UGT Servicios Públicos Salamanca. 
            </p>
            <p>
              Todos los certificados aquí generados incluyen el texto normativo pertinente, aclarando que no implican homologación oficial automática. La información sensible de los participantes está protegida en la verificación pública y no incluye DNI completo.
            </p>
          </div>
          <div className="mt-auto p-4 bg-slate-50 text-[10px] text-slate-400 italic text-center border-t border-slate-100">
            "Este documento acredita exclusivamente la participación, asistencia, docencia... No implica homologación oficial."
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
            </div>
            <h4 className="text-sm font-bold mb-2">Seguridad de Datos</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed relative z-10">
              Todos los datos sensibles (DNI, Email, Teléfono) se encuentran enmascarados en la página de verificación pública.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
