import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GoogleDriveUser } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-prompt or user is signed in to firebase without fresh google token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCurrentDriveUser = (): GoogleDriveUser | null => {
  const current = auth.currentUser;
  if (!current) return null;
  return {
    displayName: current.displayName,
    email: current.email,
    photoURL: current.photoURL,
  };
};

/**
 * Upload an image file to Google Drive using multipart upload.
 */
export async function uploadImageToDrive(
  file: File,
  flowerName: string,
  token: string
): Promise<{ fileId: string; webViewLink?: string; webContentLink?: string; thumbnailLink?: string }> {
  const metadata = {
    name: `flower_${flowerName.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_${Date.now()}.${file.name.split('.').pop() || 'png'}`,
    mimeType: file.type || 'image/png',
    description: `Flower image for: ${flowerName} (Flower & Member Tracker)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const fileData = await fileDataPromise;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `${delimiter}Content-Type: ${file.type || 'image/png'}\r\n\r\n`;

  // Construct multipart Uint8Array payload
  const enc = new TextEncoder();
  const metaBytes = enc.encode(metadataPart);
  const mediaHeaderBytes = enc.encode(mediaHeader);
  const closeBytes = enc.encode(closeDelimiter);

  const totalLength = metaBytes.byteLength + mediaHeaderBytes.byteLength + fileData.byteLength + closeBytes.byteLength;
  const combinedBuffer = new Uint8Array(totalLength);

  let offset = 0;
  combinedBuffer.set(metaBytes, offset);
  offset += metaBytes.byteLength;
  combinedBuffer.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.byteLength;
  combinedBuffer.set(new Uint8Array(fileData), offset);
  offset += fileData.byteLength;
  combinedBuffer.set(closeBytes, offset);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBuffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  // Try to create public permission so the image preview works easily in browser if allowed
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (err) {
    console.warn('Could not set anyone permission on Drive file:', err);
  }

  return {
    fileId: result.id,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink,
    thumbnailLink: result.thumbnailLink || `https://drive.google.com/thumbnail?id=${result.id}&sz=w600`,
  };
}
