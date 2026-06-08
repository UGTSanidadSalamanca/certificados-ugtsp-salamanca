export type UserRole = 'superadmin' | 'formacion_admin' | 'formacion_editor' | 'consulta';

export type Profile = {
  id: string; // references auth.users
  full_name: string;
  role: UserRole;
  created_at?: string | number;
  updated_at?: string | number;
};

export type Person = {
  id: string;
  full_name: string;
  dni_nie?: string;
  dni_last4?: string;
  email?: string;
  phone?: string;
  notes_internal?: string;
  created_at?: string | number;
  updated_at?: string | number;
  created_by?: string;
};

export type ActionStatus = 'Borrador' | 'Activa' | 'Finalizada' | 'Cancelada';

export type TrainingAction = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  syllabus?: string; // Temario
  modality: 'Presencial' | 'Online' | 'Mixta';
  location?: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  organizing_entity: string;
  external_entity?: string;
  official_recognition: boolean;
  recognition_text?: string;
  status: ActionStatus;
  created_at?: string | number;
  updated_at?: string | number;
  created_by?: string;
};

export type CertificateType = 
  | 'Asistencia' 
  | 'Aprovechamiento interno' 
  | 'Participación' 
  | 'Docencia' 
  | 'Ponencia' 
  | 'Tutorización' 
  | 'Preparación' 
  | 'Coordinación' 
  | 'Colaboración sindical/formativa' 
  | 'Otro';

export type CertificateStatus = 'borrador' | 'emitido' | 'válido' | 'revocado' | 'anulado' | 'sustituido';

export type Certificate = {
  id: string;
  visible_code: string;
  verification_token: string;
  person_id: string;
  action_id: string;
  certificate_type: CertificateType;
  role_certified?: string;
  certified_hours: number;
  issue_date?: string;
  signed_by_name: string;
  signed_by_position: string;
  status: CertificateStatus;
  public_notes?: string;
  internal_notes?: string;
  pdf_path?: string;
  pdf_sha256?: string;
  replaced_by_certificate_id?: string;
  revoked_reason?: string;
  revoked_at?: string;
  created_at?: string | number;
  updated_at?: string | number;
  created_by?: string;
  issued_by?: string;
};

export type CertificateDetail = Certificate & {
  action: TrainingAction;
  person: Person;
};

export type CertificateEvent = {
  id: string;
  certificate_id: string;
  event_type: string;
  event_description: string;
  performed_by: string;
  created_at: string;
  metadata?: any;
};
