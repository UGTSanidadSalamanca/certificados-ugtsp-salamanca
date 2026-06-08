import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CertificateDetail, TrainingAction, Person } from '../types';
import { dataStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Link as LinkIcon, Printer, CheckCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';

export default function Certificados() {
  const [certs, setCerts] = useState<CertificateDetail[]>([]);
  const [actions, setActions] = useState<TrainingAction[]>([]);
  const [participants, setParticipants] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  // Form State
  const [actionId, setActionId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [role, setRole] = useState<'Asistente' | 'Ponente' | 'Docente' | 'Coordinador' | 'Colaborador'>('Asistente');

  const loadData = async () => {
    const [c, a, p] = await Promise.all([
      dataStore.getCertificates(),
      dataStore.getActions(),
      dataStore.getPeople()
    ]);
    setCerts(c);
    setActions(a);
    setParticipants(p);
  };
  
  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataStore.createCertificate({ action_id: actionId, person_id: participantId, role_certified: role, certificate_type: 'Participación', certified_hours: actions.find(a => a.id === actionId)?.total_hours || 0, signed_by_name: 'Dirección', signed_by_position: 'Delegación Salamanca' });
      setOpen(false);
      loadData();
      toast.success("Certificado generado como borrador.");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleUpdateState = async (id: string, newState: any) => {
    try {
      await dataStore.updateCertificateState(id, newState);
      loadData();
      toast.success("Estado actualizado.");
    } catch (err: any) {
      toast.error("Error al actualizar");
    }
  };

  const getStateBadge = (state: string) => {
    switch(state) {
      case 'válido': return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[9px] uppercase tracking-wider">Válido</span>;
      case 'revocado': return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wider">Revocado</span>;
      case 'borrador': return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[9px] uppercase tracking-wider">Borrador</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider">{state}</span>;
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/#/v/${token}`;
    setCopiedLink(url);
    setCopyDialogOpen(true);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success("Enlace copiado al portapapeles.");
        })
        .catch((err) => {
          console.warn("Clipboard copy blocked", err);
        });
    } else {
      try {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast.success("Enlace copiado.");
      } catch (e) {
        console.warn("ExecCommand copy failed", e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Emisión de Certificados</h2>
          <p className="text-slate-500 mt-1">Generación y control de estados de certificados internos.</p>
        </div>
        
        <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Emitir Certificado
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Emisión</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Acción Formativa</Label>
                <Select value={actionId} onValueChange={setActionId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                  <SelectContent>
                    {actions.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Participante</Label>
                 <Select value={participantId} onValueChange={setParticipantId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                  <SelectContent>
                    {participants.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name} - {p.dni_nie || 'Sin DNI'}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Rol del Documento</Label>
                 <Select value={role} onValueChange={(r: any) => setRole(r)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asistente">Asistente</SelectItem>
                    <SelectItem value="Ponente">Ponente</SelectItem>
                    <SelectItem value="Docente">Docente</SelectItem>
                    <SelectItem value="Coordinador">Coordinador</SelectItem>
                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={!actionId || !participantId}>Generar Borrador</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Código Único</TableHead>
              <TableHead>Participante</TableHead>
              <TableHead>Acción Formativa</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.visible_code}</TableCell>
                <TableCell className="font-medium">{c.person?.full_name}</TableCell>
                <TableCell className="text-slate-600 truncate max-w-[200px]" title={c.action?.title}>
                  {c.action?.title}
                </TableCell>
                <TableCell>{c.role_certified}</TableCell>
                <TableCell>{getStateBadge(c.status)}</TableCell>
                <TableCell className="text-right">
                   <div className="flex justify-end items-center gap-2 font-mono">
                      <Button variant="ghost" size="icon" title="Copiar Enlace Público" onClick={() => handleCopyLink(c.verification_token)}>
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Link 
                        to={`/v/${c.verification_token}?print=true`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                        title="Imprimir / Ver"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>

                      {c.status === 'borrador' && (
                        <Button variant="ghost" size="icon" title="Validar" onClick={() => handleUpdateState(c.id, 'válido')}>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </Button>
                      )}
                      {c.status === 'válido' && (
                         <Button variant="ghost" size="icon" title="Revocar" onClick={() => handleUpdateState(c.id, 'revocado')}>
                          <Ban className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                   </div>
                </TableCell>
              </TableRow>
            ))}
            {certs.length === 0 && (
               <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No hay certificados generados.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación Pública</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-500">
              Cualquier persona con este enlace podrá verificar en línea e imprimir la legitimidad del certificado de formación.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={copiedLink}
                className="flex-1 px-3 py-2 text-xs border rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300 font-mono select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button 
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(copiedLink)
                      .then(() => toast.success("Enlace copiado."))
                      .catch(() => {
                        toast.error("Error al copiar automáticamente.");
                      });
                  } else {
                    toast.error("Tu navegador bloquea el portapapeles.");
                  }
                }}
                className="bg-slate-900 text-white shrink-0"
              >
                Copiar
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Link
                to={copiedLink.replace(window.location.origin + '/#', '')}
                onClick={() => setCopyDialogOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border"
              >
                Abrir Enlace Público <Printer className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
