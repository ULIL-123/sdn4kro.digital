import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { CalonSiswa } from './types';

// Use the existing core firebase app instance or initialize
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add the required Drive scope for general drive access or specific files
provider.addScope('https://www.googleapis.com/auth/drive');

// Cache the access token and user info in memory.
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // We have a user firebase-auth session, but not the OAuth token.
        // The user must sign in with popup to grant the oAuth tokens initially.
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start sign-in flow
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Sign In');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Define structure of drive backup files
export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
  webViewLink?: string;
}

/**
 * List backups stored on Google Drive (by searching for a name containing 'PPDB')
 */
export const listDriveBackups = async (token: string): Promise<DriveBackupFile[]> => {
  try {
    const q = encodeURIComponent("name contains 'PPDB_SDN4_Kronggen' and trashed = false");
    const fields = encodeURIComponent("files(id, name, mimeType, createdTime, size, webViewLink)");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime%2520desc`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Google Drive API error: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing backups on Google Drive:', error);
    throw error;
  }
};

/**
 * Creates/Uploads a JSON backup of candidate students list to Google Drive
 */
export const uploadBackupToDrive = async (
  token: string, 
  students: CalonSiswa[],
  filename: string = `PPDB_SDN4_Kronggen_Backup_${new Date().toISOString().split('T')[0]}.json`
): Promise<DriveBackupFile> => {
  try {
    const boundary = '3d9f2c7a-8b1e-4c3d-bd8e';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: filename,
      mimeType: 'application/json',
      description: 'Backup Basis Data Pendaftaran SPMB SD Negeri 4 Kronggen',
    };

    const fileContent = JSON.stringify(students, null, 2);

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      close_delimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,size,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Upload gagal: ${response.status} - ${errorMsg}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading backup to Google Drive:', error);
    throw error;
  }
};

/**
 * Delete a file by file ID
 */
export const deleteDriveFile = async (token: string, fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Delete failed: ${response.status} - ${errorMsg}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Google Drive file:', error);
    throw error;
  }
};
