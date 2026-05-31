import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import { CalonSiswa, Kegiatan } from './types';
import { MOCK_REGISTRATIONS, DEFAULT_KEGIATAN } from './utils';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Listen to all students in Firestore in real-time
export function subscribeStudentsRealtime(onUpdate: (students: CalonSiswa[]) => void) {
  const collectionRef = collection(db, 'students');
  return onSnapshot(collectionRef, (snapshot) => {
    if (snapshot.empty) {
      console.log('Firestore students collection is empty. Displaying local mock registrations.');
      onUpdate(MOCK_REGISTRATIONS);
    } else {
      const list: CalonSiswa[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CalonSiswa);
      });
      // Sort newest registration first
      list.sort((a, b) => new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime());
      onUpdate(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'students');
  });
}

// Listen to all kegiatan in Firestore in real-time
export function subscribeKegiatanRealtime(onUpdate: (kegiatan: Kegiatan[]) => void) {
  const collectionRef = collection(db, 'kegiatan');
  return onSnapshot(collectionRef, (snapshot) => {
    if (snapshot.empty) {
      console.log('Firestore kegiatan collection is empty. Displaying local default kegiatan.');
      onUpdate(DEFAULT_KEGIATAN);
    } else {
      const list: Kegiatan[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Kegiatan);
      });
      onUpdate(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'kegiatan');
  });
}

// Listen to custom logo configurations in real-time
export function subscribeLogosRealtime(onUpdate: (sdnLogo: string | null, dinasLogo: string | null) => void) {
  const docRef = doc(db, 'logos', 'config');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate(data.sdnLogo || null, data.dinasLogo || null);
    } else {
      onUpdate(null, null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'logos/config');
  });
}

// Writes
export async function saveStudentToFirestore(student: CalonSiswa): Promise<boolean> {
  const path = `students/${student.id}`;
  try {
    const docRef = doc(db, 'students', student.id);
    await setDoc(docRef, student);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteStudentFromFirestore(id: string): Promise<boolean> {
  const path = `students/${id}`;
  try {
    const docRef = doc(db, 'students', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

export async function saveKegiatanToFirestore(keg: Kegiatan): Promise<boolean> {
  const path = `kegiatan/${keg.id}`;
  try {
    const docRef = doc(db, 'kegiatan', keg.id);
    await setDoc(docRef, keg);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteKegiatanFromFirestore(id: string): Promise<boolean> {
  const path = `kegiatan/${id}`;
  try {
    const docRef = doc(db, 'kegiatan', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

export async function saveLogosToFirestore(sdnLogo: string | null, dinasLogo: string | null): Promise<boolean> {
  const path = 'logos/config';
  try {
    const docRef = doc(db, 'logos', 'config');
    await setDoc(docRef, { sdnLogo, dinasLogo });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}
