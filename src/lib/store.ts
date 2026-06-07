import { TrainingAction, Person, Certificate, CertificateDetail, Profile, UserRole, CertificateEvent } from '../types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';

const uid = () => Math.random().toString(36).substring(2, 9);
const genCode = () => `UGTSP-SA-FOR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')}-${uid().toUpperCase()}`;
const genToken = () => crypto.randomUUID ? crypto.randomUUID() : uid() + uid() + uid();

export const dataStore = {
  // Actions
  async getActions(): Promise<TrainingAction[]> {
    try {
      const colRef = collection(db, 'training_actions');
      const q = query(colRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingAction));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'training_actions');
      return [];
    }
  },
  async createAction(action: Partial<TrainingAction>) {
    const actionId = doc(collection(db, 'training_actions')).id;
    const payload = {
      ...action,
      status: 'Borrador',
      official_recognition: action.official_recognition || false,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: auth.currentUser?.uid || 'unknown'
    };
    try {
      await setDoc(doc(db, 'training_actions', actionId), payload);
      return { id: actionId, ...payload } as TrainingAction;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'training_actions');
    }
  },
  async updateAction(id: string, action: Partial<TrainingAction>) {
    try {
      await updateDoc(doc(db, 'training_actions', id), {
        ...action,
        updated_at: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `training_actions/${id}`);
    }
  },

  // People
  async getPeople(): Promise<Person[]> {
    try {
      const colRef = collection(db, 'people');
      const q = query(colRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
    } catch (error) {
      // If we don't have indexes or get permission denied due to offline etc.
      // just try raw getDocs without order
      try {
         const snapshot = await getDocs(collection(db, 'people'));
         return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      } catch (err2) {
         handleFirestoreError(err2, OperationType.LIST, 'people');
         return [];
      }
    }
  },
  async createPerson(p: Partial<Person>) {
    const id = doc(collection(db, 'people')).id;
    const payload = {
      ...p,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: auth.currentUser?.uid || 'unknown'
    };
    try {
      await setDoc(doc(db, 'people', id), payload);
      return { id, ...payload } as Person;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'people');
    }
  },

  // Certificates
  async getCertificates(): Promise<CertificateDetail[]> {
    try {
      const snapshot = await getDocs(collection(db, 'certificates'));
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
      
      const actionsMap = new Map();
      const peopleMap = new Map();
      
      const res: CertificateDetail[] = [];
      for (const c of certs) {
        if (!actionsMap.has(c.action_id)) {
           const aDoc = await getDoc(doc(db, 'training_actions', c.action_id));
           actionsMap.set(c.action_id, { id: aDoc.id, ...aDoc.data() });
        }
        if (!peopleMap.has(c.person_id)) {
           const pDoc = await getDoc(doc(db, 'people', c.person_id));
           peopleMap.set(c.person_id, { id: pDoc.id, ...pDoc.data() });
        }
        res.push({
           ...c,
           action: actionsMap.get(c.action_id),
           person: peopleMap.get(c.person_id)
        });
      }
      return res;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'certificates');
      return [];
    }
  },
  
  async getCertificateByToken(token: string): Promise<CertificateDetail | null> {
    try {
      const q = query(collection(db, 'certificates'), where('verification_token', '==', token));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const cDoc = snapshot.docs[0];
      const c = { id: cDoc.id, ...cDoc.data() } as Certificate;
      
      const aDoc = await getDoc(doc(db, 'training_actions', c.action_id));
      const pDoc = await getDoc(doc(db, 'people', c.person_id));
      
      return {
        ...c,
        action: { id: aDoc.id, ...aDoc.data() } as TrainingAction,
        person: { id: pDoc.id, ...pDoc.data() } as Person
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'certificates');
      return null;
    }
  },

  async createCertificate(payload: Partial<Certificate>) {
    const id = doc(collection(db, 'certificates')).id;
    const dataObj = {
       ...payload,
       status: 'borrador' as const,
       issue_date: new Date().toISOString(),
       visible_code: genCode(),
       verification_token: genToken(),
       created_at: Date.now(),
       updated_at: Date.now(),
       created_by: auth.currentUser?.uid || 'unknown'
    };
    try {
      await setDoc(doc(db, 'certificates', id), dataObj);
      return { id, ...dataObj } as Certificate;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'certificates');
    }
  },

  async updateCertificateState(id: string, state: Certificate['status'], reason?: string) {
    const payload: any = { status: state, updated_at: Date.now() };
    if (state === 'revocado' || state === 'anulado') {
        payload.revoked_at = new Date().toISOString();
        if (reason) payload.revoked_reason = reason;
    }
    try {
      await updateDoc(doc(db, 'certificates', id), payload);
      
      // Log event
      const eventId = doc(collection(db, 'certificate_events')).id;
      await setDoc(doc(db, 'certificate_events', eventId), {
        certificate_id: id,
        event_type: 'STATUS_CHANGE',
        event_description: `Status changed to ${state}`,
        performed_by: auth.currentUser?.uid || 'unknown',
        created_at: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `certificates/${id}`);
    }
  }
};
