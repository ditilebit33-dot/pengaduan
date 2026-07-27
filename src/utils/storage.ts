import { Complaint, OfficerConfig, BidangOfficerConfigs, BidangType } from '../types';
import { INITIAL_COMPLAINTS, DEFAULT_OFFICER_CONFIG, DEFAULT_OFFICER_CONFIGS } from '../data/constants';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

const COMPLAINTS_KEY = 'disdukcapil_tanimbar_complaints_v1';
const OFFICER_CONFIG_KEY = 'disdukcapil_tanimbar_officer_v1';
const OFFICER_CONFIGS_MAP_KEY = 'disdukcapil_tanimbar_officers_v2';

export const getStoredComplaints = (): Complaint[] => {
  try {
    const raw = localStorage.getItem(COMPLAINTS_KEY);
    if (!raw) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: Complaint[] = JSON.parse(raw);
    // Filter out initial dummy data if present
    const cleaned = parsed.filter(c => !c.id.startsWith('TK-TNB-20260725-001') && !c.id.startsWith('TK-TNB-20260726-002') && !c.id.startsWith('TK-TNB-20260726-003') && !c.id.startsWith('TK-TNB-20260724-004'));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Failed to parse complaints from storage', err);
    return [];
  }
};

export const saveComplaints = (complaints: Complaint[]): void => {
  try {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save complaints to storage', err);
  }
};

export const addComplaint = (newComplaint: Complaint): void => {
  const current = getStoredComplaints();
  const updated = [newComplaint, ...current];
  saveComplaints(updated);

  // Sync to Firestore
  const docRef = doc(db, 'complaints', newComplaint.id);
  setDoc(docRef, newComplaint).catch((error) => {
    handleFirestoreError(error, OperationType.CREATE, `complaints/${newComplaint.id}`);
  });
};

export const updateComplaintStatus = (
  id: string,
  status: Complaint['status'],
  catatanPetugas?: string,
  petugasName: string = 'Petugas Disdukcapil Tanimbar'
): Complaint | null => {
  const complaints = getStoredComplaints();
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) return null;

  complaints[idx] = {
    ...complaints[idx],
    status,
    catatanPetugas: catatanPetugas || complaints[idx].catatanPetugas,
    tanggalVerifikasi: new Date().toISOString(),
    petugasVerifikasi: petugasName
  };

  saveComplaints(complaints);

  // Sync update to Firestore
  const docRef = doc(db, 'complaints', id);
  setDoc(docRef, complaints[idx], { merge: true }).catch((error) => {
    handleFirestoreError(error, OperationType.UPDATE, `complaints/${id}`);
  });

  return complaints[idx];
};

export const updateComplaintEmailStatus = (
  id: string,
  emailSent: boolean,
  emailMessageId?: string
): Complaint | null => {
  const complaints = getStoredComplaints();
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) return null;

  complaints[idx] = {
    ...complaints[idx],
    emailSent,
    emailSentAt: new Date().toISOString(),
    emailMessageId
  };

  saveComplaints(complaints);

  // Sync email status to Firestore
  const docRef = doc(db, 'complaints', id);
  setDoc(docRef, { emailSent, emailSentAt: complaints[idx].emailSentAt, emailMessageId }, { merge: true }).catch((error) => {
    handleFirestoreError(error, OperationType.UPDATE, `complaints/${id}`);
  });

  return complaints[idx];
};

export const getStoredOfficerConfigs = (): BidangOfficerConfigs => {
  try {
    const raw = localStorage.getItem(OFFICER_CONFIGS_MAP_KEY);
    if (!raw) {
      localStorage.setItem(OFFICER_CONFIGS_MAP_KEY, JSON.stringify(DEFAULT_OFFICER_CONFIGS));
      setDoc(doc(db, 'config', 'officers'), DEFAULT_OFFICER_CONFIGS, { merge: true }).catch(() => {});
      return DEFAULT_OFFICER_CONFIGS;
    }
    const parsed = JSON.parse(raw);
    return {
      pendaftaran_penduduk: parsed.pendaftaran_penduduk || DEFAULT_OFFICER_CONFIGS.pendaftaran_penduduk,
      pencatatan_sipil: parsed.pencatatan_sipil || DEFAULT_OFFICER_CONFIGS.pencatatan_sipil,
      piak: parsed.piak || DEFAULT_OFFICER_CONFIGS.piak
    };
  } catch (err) {
    return DEFAULT_OFFICER_CONFIGS;
  }
};

export const getOfficerForBidang = (bidang: BidangType): OfficerConfig => {
  const configs = getStoredOfficerConfigs();
  return configs[bidang] || DEFAULT_OFFICER_CONFIGS[bidang] || DEFAULT_OFFICER_CONFIG;
};

export const saveOfficerConfigs = (configs: BidangOfficerConfigs): void => {
  try {
    localStorage.setItem(OFFICER_CONFIGS_MAP_KEY, JSON.stringify(configs));
  } catch (err) {
    console.error('Failed to save officer configs', err);
  }

  // Sync to Firestore document config/officers
  setDoc(doc(db, 'config', 'officers'), configs, { merge: true }).catch((error) => {
    handleFirestoreError(error, OperationType.WRITE, 'config/officers');
  });
};

export const getStoredOfficerConfig = (): OfficerConfig => {
  return getOfficerForBidang('pendaftaran_penduduk');
};

export const saveOfficerConfig = (config: OfficerConfig): void => {
  const current = getStoredOfficerConfigs();
  current.pendaftaran_penduduk = config;
  saveOfficerConfigs(current);
};

// Real-time Firestore sync listener for live updates across browser sessions
export const initFirestoreSync = (onUpdate?: () => void) => {
  try {
    // Listen to complaints collection
    onSnapshot(collection(db, 'complaints'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreComplaints: Complaint[] = [];
        snapshot.forEach((docSnap) => {
          firestoreComplaints.push(docSnap.data() as Complaint);
        });
        
        // Sort descending by tanggalPengaduan
        firestoreComplaints.sort((a, b) => new Date(b.tanggalPengaduan).getTime() - new Date(a.tanggalPengaduan).getTime());
        localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(firestoreComplaints));
        if (onUpdate) onUpdate();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'complaints');
    });

    // Listen to officer configs (multi-officer)
    onSnapshot(doc(db, 'config', 'officers'), (docSnap) => {
      if (docSnap.exists()) {
        const configsData = docSnap.data() as BidangOfficerConfigs;
        localStorage.setItem(OFFICER_CONFIGS_MAP_KEY, JSON.stringify(configsData));
        if (onUpdate) onUpdate();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/officers');
    });
  } catch (err) {
    console.warn('Firestore sync setup initialized with offline cache fallback.', err);
  }
};

export const generateTicketNumber = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `TK-TNB-${dateStr}-${randomNum}`;
};

