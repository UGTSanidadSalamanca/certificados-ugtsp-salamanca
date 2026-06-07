import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CertificateDetail } from '../types';
import { dataStore } from '../lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, ShieldCheck, Download, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to mask DNI: 12345678A -> ***4567**
const maskDNI = (dni: string) => dni.replace(/^(.{3})(.*)(.{2})$/, '***$2**');

export default function PublicVerify() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const isPrint = searchParams.get('print') === 'true';
  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      const data = await dataStore.getCertificateByToken(token);
      setCert(data);
      setLoading(false);
    }
    load();
  }, [token]);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !cert) return;
    setDownloading(true);
    try {
      const element = certificateRef.current;
      // Hide back page temporarily if we want to print separately, or just grab the container
      // wait, certificateRef.current can be a wrapper containing both pages. 
      // It's easier if we select page 1 and page 2.
      const page1 = document.getElementById('cert-page-1');
      const page2 = document.getElementById('cert-page-2');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      if (page1) {
        const canvas1 = await html2canvas(page1, { scale: 2 });
        pdf.addImage(canvas1.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
      }

      if (page2 && cert.action.syllabus) {
        pdf.addPage();
        const canvas2 = await html2canvas(page2, { scale: 2 });
        pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
      }

      pdf.save(`Certificado_${cert.visible_code}.pdf`);
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verificando...</div>;

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
           <ShieldAlert className="w-16 h-16 text-slate-400 mx-auto mb-4" />
           <h1 className="text-xl font-bold text-slate-900">Certificado No Encontrado</h1>
           <p className="text-slate-500 mt-2">El token proporcionado no corresponde a ningún registro en nuestro sistema.</p>
        </div>
      </div>
    );
  }

  const isValid = cert.status === 'válido';
  const verifyUrl = `${window.location.origin}/v/${cert.verification_token}`;

  return (
    <div className={`min-h-screen ${isPrint ? 'bg-white' : 'bg-slate-50 py-8 px-4'} flex flex-col items-center`}>
      
      {!isPrint && (
        <div className="max-w-[297mm] w-full mb-6 mx-auto flex flex-col gap-4">
           {/* Verification Status Header */}
           <div className={`p-4 rounded-xl border flex items-start gap-4 ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              {isValid ? <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />}
              <div>
                <h2 className={`font-bold text-lg tracking-tight ${isValid ? 'text-emerald-900' : 'text-red-900'}`}>
                  {isValid ? 'Documento Acreditativo Interno Válido' : `Estado: ${cert.status.toUpperCase()}`}
                </h2>
                <p className={`text-sm mt-1 ${isValid ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isValid 
                    ? `Este certificado es auténtico y está registrado en UGT Servicios Públicos bajo el código único: ${cert.visible_code}.` 
                    : 'Este documento no es válido en el sistema actualmente.'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                   <Info className="w-4 h-4" /> Los datos personales han sido anonimizados por protección de datos.
                </div>
              </div>
           </div>
           
           <div className="flex justify-end">
              <Button onClick={handleDownloadPDF} disabled={!isValid || downloading} className="bg-slate-900 text-white">
                <Download className="w-4 h-4 mr-2" /> {downloading ? 'Generando...' : 'Descargar PDF'}
              </Button>
           </div>
        </div>
      )}

      {/* The Certificate A4 Landscape Canvas Wrapper */}
      <div ref={certificateRef} className="flex flex-col gap-8 print:gap-0">
        
        {/* Page 1: Certificate Front */}
        <div 
          id="cert-page-1"
          className="bg-white mx-auto relative shadow-2xl overflow-hidden print:shadow-none"
          style={{ width: '297mm', height: '210mm', boxSizing: 'border-box', breakInside: 'avoid', pageBreakAfter: 'always' }}
        >
          {/* Certificate Border / Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-bl-full opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-tr-full opacity-5"></div>
          
          <div className="absolute inset-8 border-4 border-slate-100 p-12 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 flex items-center justify-center rounded text-white font-bold text-xl uppercase shadow-md">
                     UGT
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Servicios Públicos</h1>
                     <h2 className="text-slate-500 font-medium">Delegación Salamanca</h2>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono text-slate-400">CÓDIGO: {cert.visible_code}</p>
               </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 mt-8">
               <p className="text-lg text-slate-600 uppercase tracking-widest font-medium">
                 Documento Acreditativo Interno
               </p>
               <p className="text-slate-500 italic">otorgado a</p>
               <div>
                  <h2 className="text-4xl font-bold text-slate-900 font-serif tracking-tight">{cert.person.full_name}</h2>
                  <p className="text-slate-500 mt-2 font-mono tracking-wider">
                    DNI/NIE: {isPrint && cert.person.dni_nie ? cert.person.dni_nie : (cert.person.dni_nie ? maskDNI(cert.person.dni_nie) : 'N/A')}
                  </p>
               </div>
               
               <p className="text-slate-500 italic mt-6">en calidad de <span className="font-semibold text-slate-800">{cert.role_certified}</span> en</p>
               
               <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">"{cert.action.title}"</h3>
                  <p className="text-slate-600 mt-4">
                     Realizado del {format(new Date(cert.action.start_date || new Date().toISOString()), 'dd MMM', {locale: es})} al {format(new Date(cert.action.end_date || new Date().toISOString()), 'dd MMM yyyy', {locale: es})}.<br/>
                     Modalidad {cert.action.modality} ({cert.action.total_hours} horas lectivas).
                  </p>
               </div>
            </div>

            {/* Footer & Validations */}
            <div className="mt-auto grid grid-cols-3 items-end">
               <div className="text-center px-8 border-t border-slate-300 pt-2">
                  <p className="font-medium text-slate-800">{cert.signed_by_name || 'Dirección'}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{cert.signed_by_position || 'Delegación'}</p>
               </div>
               
               <div className="flex justify-center text-[10px] text-slate-400 text-center px-4 leading-tight">
                  Este documento acredita exclusivamente la participación, asistencia, docencia, ponencia, tutorización, coordinación o colaboración descrita. No implica homologación oficial ni reconocimiento como mérito baremable salvo que así conste expresamente por la entidad competente.
               </div>

               <div className="flex flex-col items-end">
                  <div className="p-2 border border-slate-200 bg-white shadow-sm mb-2">
                     <QRCodeSVG value={verifyUrl} size={84} level="M" />
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Escanee para verificar</p>
               </div>
            </div>

            {!isValid && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="transform -rotate-45 text-[150px] font-bold opacity-10 text-red-600 uppercase">
                    {cert.status}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Page 2: Certificate Back (Syllabus) */}
        {cert.action.syllabus && (
          <div 
            id="cert-page-2"
            className="bg-white mx-auto relative shadow-2xl overflow-hidden print:shadow-none"
            style={{ width: '297mm', height: '210mm', boxSizing: 'border-box', breakInside: 'avoid' }}
          >
            {/* Subtle decorations for the back */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100 rounded-tr-full opacity-50"></div>

            <div className="absolute inset-8 border-2 border-slate-50 p-12 flex flex-col">
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-xl tracking-tight hidden">Contenidos</h3>
                  <h4 className="text-slate-600 text-sm font-medium uppercase font-sans tracking-widest">Temario / Índice de Materias</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-slate-400">REF: {cert.visible_code}</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase">{cert.action.title}</p>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="prose prose-sm prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {cert.action.syllabus}
                </div>
              </div>
              
              <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-end">
                <p className="text-xs text-slate-400">Página 2 - {cert.person.full_name}</p>
                <div className="opacity-50 grayscale">
                  <QRCodeSVG value={verifyUrl} size={48} level="L" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
