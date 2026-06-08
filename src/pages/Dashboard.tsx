import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { dataStore } from '../lib/store';
import { Users, FileText, GraduationCap, CheckCircle, Download, Upload, RefreshCw, Database } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ actions: 0, participants: 0, certificates: 0, valid: 0 });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
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
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExport = () => {
    try {
      const dataStr = dataStore.exportDatabase();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Copia_Seguridad_Certificados_UGT_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMsg({ text: 'Copia de seguridad exportada correctamente.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (e) {
      setMsg({ text: 'Error al exportar los datos.', type: 'error' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = dataStore.importDatabase(content);
      if (success) {
        setMsg({ text: '¡Bases de datos importadas e integradas correctamente!', type: 'success' });
        loadStats();
      } else {
        setMsg({ text: 'El archivo JSON no tiene un formato válido para este sistema.', type: 'error' });
      }
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres restablecer todos los datos a la demostración original? Perderás cualquier cambio actual.')) {
      dataStore.resetToDefault();
      loadStats();
      setMsg({ text: 'Se han restablecido los datos demo originales.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full -m-8">
      <div className="p-8 flex-1 grid grid-cols-12 gap-6 overflow-y-auto">
        
        {/* KPI Stats Grid */}
        <div className="col-span-12 grid grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Certificados Emitidos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.certificates}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Certificados Válidos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.valid}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Acciones Formativas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.actions}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Personas Registradas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.participants}</p>
            </div>
          </div>
        </div>

        {/* Main Info Box */}
        <div className="col-span-8 space-y-6 flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800">Información Importante</h3>
            </div>
            <div className="p-6 text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                Este sistema es responsable de la gestión y mantenimiento de las certificaciones formativas de <strong>UGT Servicios Públicos Salamanca</strong>.
              </p>
              <p>
                Todos los certificados generados incluyen el texto normativo pertinente, aclarando que acreditan la participación en actividades internas de formación y no implican homologación oficial automática a menos que se especifique expresamente lo contrario.
              </p>
              <p>
                La información sensible de los participantes está protegida en la verificación pública y no incluye datos sensibles como el DNI completo.
              </p>
            </div>
            <div className="mt-auto p-4 bg-slate-50 text-[10px] text-slate-400 font-medium italic text-center border-t border-slate-100 tracking-wide">
              "Este documento acredita exclusivamente la participación, asistencia, docencia o acción formativa. No implica homologación oficial de rango superior."
            </div>
          </div>
        </div>

        {/* Backup and DB Tools Sidebar Card */}
        <div className="col-span-4 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Database className="w-4 h-4 text-red-600" />
                <CardTitle className="text-sm font-bold">Copia de Seguridad Local</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Gestiona tus datos de forma 100% segura en tu navegador. Puedes guardar respaldos en tu equipo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {msg.text && (
                <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                  msg.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {msg.text}
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
              />

              <Button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 h-9 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Copia (JSON)
              </Button>

              <Button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 h-9 text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Importar Copia (JSON)
              </Button>

              <hr className="border-slate-100 my-1" />

              <div className="pt-1">
                <Button 
                  variant="ghost"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-[11px] font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restablecer Datos Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
