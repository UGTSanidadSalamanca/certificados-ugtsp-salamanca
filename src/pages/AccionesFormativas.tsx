import React, { useEffect, useState } from 'react';
import { TrainingAction } from '../types';
import { dataStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function AccionesFormativas() {
  const [actions, setActions] = useState<TrainingAction[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modality, setModality] = useState<'Presencial' | 'Online' | 'Mixta'>('Presencial');
  const [location, setLocation] = useState('');
  const [director, setDirector] = useState('');
  const [syllabus, setSyllabus] = useState('');

  const loadData = async () => setActions(await dataStore.getActions());
  useEffect(() => { loadData(); }, []);

  const openNew = () => {
    setEditingId(null);
    setTitle('');
    setHours('');
    setStartDate('');
    setEndDate('');
    setModality('Presencial');
    setLocation('');
    setDirector('');
    setSyllabus('');
    setOpen(true);
  };

  const openEdit = (a: TrainingAction) => {
    setEditingId(a.id);
    setTitle(a.title);
    setHours(a.total_hours.toString());
    setStartDate(a.start_date.split('T')[0]); // assuming YYYY-MM-DD
    setEndDate(a.end_date.split('T')[0]);
    setModality(a.modality);
    setLocation(a.location || '');
    setDirector(a.organizing_entity || '');
    setSyllabus(a.syllabus || '');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await dataStore.updateAction(editingId, {
        title, total_hours: Number(hours), start_date: startDate, end_date: endDate, modality, location, organizing_entity: director, syllabus
      });
      toast.success("Acción formativa actualizada");
    } else {
      await dataStore.createAction({
        title, total_hours: Number(hours), start_date: startDate, end_date: endDate, modality, location, organizing_entity: director, syllabus
      });
      toast.success("Acción formativa creada");
    }
    setOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Acciones Formativas</h2>
          <p className="text-slate-500 mt-1">Gestiona los cursos, jornadas y congresos.</p>
        </div>
        
        <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Acción
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Acción Formativa' : 'Registrar Acción Formativa'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Título del Curso / Jornada</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Temario / Contenido (Reverso del certificado)</Label>
                <Textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} placeholder="Escribe aquí el índice de materias, asignaturas o temario de la actividad..." className="min-h-[120px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horas</Label>
                  <Input type="number" value={hours} onChange={e => setHours(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Select value={modality} onValueChange={(v: any) => setModality(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Mixta">Mixta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lugar / Plataforma</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
               <div className="space-y-2">
                <Label>Aprobado por / Entidad Organizadora</Label>
                <Input value={director} onChange={e => setDirector(e.target.value)} required />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit">{editingId ? 'Guardar Cambios' : 'Guardar Acción'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {format(new Date(a.start_date || new Date()), 'dd MMM yyyy', {locale: es})} - {format(new Date(a.end_date || new Date()), 'dd MMM yyyy', {locale: es})}
                </TableCell>
                <TableCell>{a.total_hours}h</TableCell>
                <TableCell>{a.modality}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(a)}>
                    <Edit className="w-4 h-4 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {actions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No hay acciones registradas.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
