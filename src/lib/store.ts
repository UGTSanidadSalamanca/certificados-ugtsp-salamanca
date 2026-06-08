import { TrainingAction, Person, Certificate, CertificateDetail, Profile, UserRole, CertificateEvent } from '../types';

const uid = () => Math.random().toString(36).substring(2, 9);
const genCode = () => `UGTSP-SA-FOR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')}-${uid().toUpperCase()}`;
const genToken = () => crypto.randomUUID ? crypto.randomUUID() : uid() + uid() + uid();

// Keys for LocalStorage
const KEYS = {
  ACTIONS: 'ugt_training_actions',
  PEOPLE: 'ugt_people',
  CERTIFICATES: 'ugt_certificates',
  EVENTS: 'ugt_certificate_events'
};

// Initial Seed Data
const DEFAULT_ACTIONS: TrainingAction[] = [
  {
    id: 'action-1',
    title: 'Ofimática y Herramientas Digitales en la Gestión Pública',
    subtitle: 'Nivel Intermedio-Avanzado (Suite LibreOffice y Google Workspace)',
    modality: 'Online',
    start_date: '2026-05-10',
    end_date: '2026-05-28',
    total_hours: 40,
    organizing_entity: 'FESP UGT Salamanca',
    official_recognition: true,
    recognition_text: 'Homologado por la Junta de Castilla y León',
    status: 'Finalizada',
    created_at: String(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updated_at: String(Date.now() - 30 * 24 * 60 * 60 * 1000),
    created_by: 'admin_local_id'
  },
  {
    id: 'action-2',
    title: 'Prevención de Riesgos Laborales y Salud Ocupacional',
    subtitle: 'Formación de Delegados de Personal',
    modality: 'Presencial',
    location: 'Sede UGT Salamanca - Gran Vía',
    start_date: '2026-06-01',
    end_date: '2026-06-05',
    total_hours: 15,
    organizing_entity: 'FESP UGT Salamanca',
    official_recognition: false,
    status: 'Activa',
    created_at: String(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updated_at: String(Date.now() - 10 * 24 * 60 * 60 * 1000),
    created_by: 'admin_local_id'
  }
];

const DEFAULT_PEOPLE: Person[] = [
  {
    id: 'person-1',
    full_name: 'María García Fernández',
    dni_nie: '12345678A',
    dni_last4: '5678A',
    email: 'maria.garcia@email.com',
    phone: '600123456',
    notes_internal: 'Afiliada a UGT Correos',
    created_at: String(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updated_at: String(Date.now() - 20 * 24 * 60 * 60 * 1000),
    created_by: 'admin_local_id'
  },
  {
    id: 'person-2',
    full_name: 'Alejandro Rodríguez Martín',
    dni_nie: '87654321B',
    dni_last4: '4321B',
    email: 'alejandro.rodriguez@email.com',
    phone: '611987654',
    notes_internal: 'Representante sindical Educación',
    created_at: String(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updated_at: String(Date.now() - 15 * 24 * 60 * 60 * 1000),
    created_by: 'admin_local_id'
  }
];

const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    visible_code: 'UGTSP-SA-FOR-2026-1024-X45F9A',
    verification_token: 'ac89befa-2038-429a-8aae-0df9a34938eb',
    person_id: 'person-1',
    action_id: 'action-1',
    certificate_type: 'Aprovechamiento interno',
    certified_hours: 40,
    issue_date: '2026-05-30T10:00:00.000Z',
    signed_by_name: 'Felipe Espugt Salamanca',
    signed_by_position: 'Secretario de Formación FESP UGT Salamanca',
    status: 'válido',
    created_at: String(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updated_at: String(Date.now() - 8 * 24 * 60 * 60 * 1000),
    created_by: 'admin_local_id'
  }
];

const DEFAULT_EVENTS: CertificateEvent[] = [
  {
    id: 'evt-1',
    certificate_id: 'cert-1',
    event_type: 'STATUS_CHANGE',
    event_description: 'Certificado creado y emitido como válido',
    performed_by: 'admin_local_id',
    created_at: String(Date.now() - 8 * 24 * 60 * 60 * 1000)
  }
];

// Local Helpers to load/save
function loadData<T>(key: string, defaultData: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Error decoding LocalStorage key ${key}:`, e);
    return defaultData;
  }
}

function saveData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Current Local session helper
export function getLocalUser() {
  const stored = localStorage.getItem('ugt_local_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export const dataStore = {
  // Actions
  async getActions(): Promise<TrainingAction[]> {
    return loadData<TrainingAction>(KEYS.ACTIONS, DEFAULT_ACTIONS);
  },
  
  async createAction(action: Partial<TrainingAction>): Promise<TrainingAction> {
    const actions = await this.getActions();
    const actionId = 'action-' + uid();
    const currentUser = getLocalUser();
    const payload: TrainingAction = {
      ...(action as any),
      id: actionId,
      status: 'Borrador',
      official_recognition: action.official_recognition || false,
      created_at: String(Date.now()),
      updated_at: String(Date.now()),
      created_by: currentUser?.email || 'admin_local_id'
    };
    actions.unshift(payload);
    saveData(KEYS.ACTIONS, actions);
    return payload;
  },
  
  async updateAction(id: string, action: Partial<TrainingAction>): Promise<void> {
    const actions = await this.getActions();
    const index = actions.findIndex(a => a.id === id);
    if (index !== -1) {
      actions[index] = {
        ...actions[index],
        ...action,
        updated_at: String(Date.now())
      };
      saveData(KEYS.ACTIONS, actions);
    }
  },

  // People
  async getPeople(): Promise<Person[]> {
    return loadData<Person>(KEYS.PEOPLE, DEFAULT_PEOPLE);
  },
  
  async createPerson(p: Partial<Person>): Promise<Person> {
    const people = await this.getPeople();
    const id = 'person-' + uid();
    const currentUser = getLocalUser();
    const payload: Person = {
      ...(p as any),
      id,
      created_at: String(Date.now()),
      updated_at: String(Date.now()),
      created_by: currentUser?.email || 'admin_local_id'
    };
    people.unshift(payload);
    saveData(KEYS.PEOPLE, people);
    return payload;
  },

  // Certificates
  async getCertificates(): Promise<CertificateDetail[]> {
    const certs = loadData<Certificate>(KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
    const actions = await this.getActions();
    const people = await this.getPeople();
    
    return certs.map(c => {
      const action = actions.find(a => a.id === c.action_id) || {
        id: c.action_id,
        title: 'Acción formativa no encontrada',
        modality: 'Online',
        start_date: '',
        end_date: '',
        total_hours: 0,
        organizing_entity: '',
        official_recognition: false,
        status: 'Cancelada'
      } as TrainingAction;
      
      const person = people.find(p => p.id === c.person_id) || {
        id: c.person_id,
        full_name: 'Persona no encontrada'
      } as Person;
      
      return {
        ...c,
        action,
        person
      };
    });
  },
  
  async getCertificateByToken(token: string): Promise<CertificateDetail | null> {
    const certs = loadData<Certificate>(KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
    const c = certs.find(x => x.verification_token === token || x.visible_code === token);
    if (!c) return null;
    
    const actions = await this.getActions();
    const people = await this.getPeople();
    
    const action = actions.find(a => a.id === c.action_id) || {
      id: c.action_id,
      title: 'Acción formativa no encontrada',
      modality: 'Online',
      start_date: '',
      end_date: '',
      total_hours: 0,
      organizing_entity: '',
      official_recognition: false,
      status: 'Cancelada'
    } as TrainingAction;
    
    const person = people.find(p => p.id === c.person_id) || {
      id: c.person_id,
      full_name: 'Persona no encontrada'
    } as Person;
    
    return {
      ...c,
      action,
      person
    };
  },

  async createCertificate(payload: Partial<Certificate>): Promise<Certificate> {
    const certs = loadData<Certificate>(KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
    const id = 'cert-' + uid();
    const currentUser = getLocalUser();
    
    const dataObj: Certificate = {
       ...(payload as any),
       id,
       status: 'borrador' as const,
       issue_date: new Date().toISOString(),
       visible_code: genCode(),
       verification_token: genToken(),
       created_at: String(Date.now()),
       updated_at: String(Date.now()),
       created_by: currentUser?.email || 'admin_local_id'
    };
    certs.unshift(dataObj);
    saveData(KEYS.CERTIFICATES, certs);
    return dataObj;
  },

  async updateCertificateState(id: string, state: Certificate['status'], reason?: string): Promise<void> {
    const certs = loadData<Certificate>(KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
    const index = certs.findIndex(c => c.id === id);
    if (index !== -1) {
      const updateData: Partial<Certificate> = {
        status: state,
        updated_at: String(Date.now())
      };
      if (state === 'revocado' || state === 'anulado') {
        updateData.revoked_at = new Date().toISOString();
        if (reason) updateData.revoked_reason = reason;
      }
      
      certs[index] = {
        ...certs[index],
        ...updateData
      };
      saveData(KEYS.CERTIFICATES, certs);
      
      // Log event
      const events = loadData<CertificateEvent>(KEYS.EVENTS, DEFAULT_EVENTS);
      const currentUser = getLocalUser();
      const eventId = 'evt-' + uid();
      
      events.unshift({
        id: eventId,
        certificate_id: id,
        event_type: 'STATUS_CHANGE',
        event_description: `Estado cambiado a ${state}${reason ? ' - Razón: ' + reason : ''}`,
        performed_by: currentUser?.email || 'admin_local_id',
        created_at: String(Date.now())
      });
      saveData(KEYS.EVENTS, events);
    }
  },

  // Export / Import Backup Methods
  exportDatabase(): string {
    const database = {
      actions: loadData<TrainingAction>(KEYS.ACTIONS, DEFAULT_ACTIONS),
      people: loadData<Person>(KEYS.PEOPLE, DEFAULT_PEOPLE),
      certificates: loadData<Certificate>(KEYS.CERTIFICATES, DEFAULT_CERTIFICATES),
      events: loadData<CertificateEvent>(KEYS.EVENTS, DEFAULT_EVENTS)
    };
    return JSON.stringify(database, null, 2);
  },

  importDatabase(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.actions && parsed.people && parsed.certificates) {
        saveData(KEYS.ACTIONS, parsed.actions);
        saveData(KEYS.PEOPLE, parsed.people);
        saveData(KEYS.CERTIFICATES, parsed.certificates);
        if (parsed.events) saveData(KEYS.EVENTS, parsed.events);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing JSON database:', e);
      return false;
    }
  },

  resetToDefault() {
    localStorage.setItem(KEYS.ACTIONS, JSON.stringify(DEFAULT_ACTIONS));
    localStorage.setItem(KEYS.PEOPLE, JSON.stringify(DEFAULT_PEOPLE));
    localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(DEFAULT_CERTIFICATES));
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
  }
};
