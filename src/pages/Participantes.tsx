import React, { useEffect, useState, useRef } from 'react';
import { Person } from '../types';
import { dataStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import Papa from 'papaparse';
import { toast } from 'sonner';

export default function Participantes() {
  const [participants, setParticipants] = useState<Person[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [open, setOpen] = useState(false);
  const [dni, setDni] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const loadData = async () => setParticipants(await dataStore.getPeople());
  useEffect(() => { loadData(); }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          let count = 0;
          for (const row of rows) {
            // expected headers: dni, name, email
            if (row.dni && row.name) {
              await dataStore.createPerson({
                dni_nie: row.dni.trim(),
                full_name: row.name.trim(),
                email: row.email?.trim() || ''
              });
              count++;
            }
          }
          toast.success(`Se importaron ${count} participantes correctamente.`);
          loadData();
        } catch (err: any) {
          toast.error("Error importando participantes", { description: err.message });
        }
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataStore.createPerson({ dni_nie: dni, full_name: name, email });
    setOpen(false);
    setDni('');
    setName('');
    setEmail('');
    loadData();
    toast.success("Participante añadido");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Participantes</h2>
          <p className="text-slate-500 mt-1">Directorio de alumnos y docentes.</p>
        </div>
        
        <div className="flex space-x-3 items-center">
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Añadir
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Participante</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>DNI / NIE</Label>
                  <Input value={dni} onChange={e => setDni(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="mx-2 w-px h-8 bg-slate-200"></div>

          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Importar CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>DNI / NIE</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.dni_nie}</TableCell>
                <TableCell>{p.full_name}</TableCell>
                <TableCell className="text-slate-500">{p.email}</TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-slate-300 mb-2" />
                    <p>No hay participantes.</p>
                    <p className="text-xs mt-1">Sube un archivo CSV con columnas: dni, name, email</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
