import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Lead } from '../types';

// Initialize Firebase App instance safely (singleton)
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

// Prompt user to select account if needed
provider.setCustomParameters({
  prompt: 'select_account'
});

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
        cachedAccessToken = null;
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
      throw new Error('No se pudo obtener el token de acceso desde Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
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

/**
 * Creates a new Google Spreadsheet and writes the Base Depurada leads into it
 */
export const exportLeadsToGoogleSheets = async (
  leads: Lead[], 
  sheetTitle: string = `KAMU CRM - Base Depurada (${new Date().toLocaleDateString('es-CO')})`
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Se requiere autenticación con Google para exportar a Google Sheets.');
  }

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: sheetTitle,
      },
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Error al crear la hoja de cálculo en Google Sheets');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Rows matching the 9 exact Base Depurada columns + extended attributes
  const headers = [
    'ID Lead',
    'Nombre / Empresa',
    'Teléfono',
    'Email',
    'Ciudad',
    'Fase Comercial',
    'Prioridad',
    'Último Contacto',
    'Próxima Acción',
    'Campaña',
    'Plataforma',
    'Tipo de Negocio',
    'Necesidad',
    'Probabilidad (%)',
    'Notas'
  ];

  const rows = leads.map(l => [
    l.id,
    l.empresa ? `${l.nombre} (${l.empresa})` : l.nombre,
    l.telefono,
    l.email,
    l.ciudad,
    l.fase,
    l.prioridad,
    l.ultimo_contacto,
    l.proxima_accion,
    l.campaign_name,
    l.plataforma,
    l.tipo_negocio,
    l.necesidad,
    `${l.probabilidad}%`,
    l.notas
  ]);

  const valueRange = {
    values: [headers, ...rows],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:O${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueRange),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json();
    throw new Error(errData.error?.message || 'Error al escribir datos en Google Sheets');
  }

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Creates a backup CSV file directly in Google Drive root or CRM folder
 */
export const backupToGoogleDrive = async (
  csvContent: string,
  fileName: string = `KAMU_CRM_Respaldo_${new Date().toISOString().slice(0, 10)}.csv`
): Promise<{ fileId: string; fileUrl: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Se requiere autenticación con Google para respaldar en Google Drive.');
  }

  const metadata = {
    name: fileName,
    mimeType: 'text/csv',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([csvContent], { type: 'text/csv' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || 'Error al guardar archivo en Google Drive');
  }

  const data = await res.json();
  const fileId = data.id;
  const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return { fileId, fileUrl };
};

/**
 * Reads responses from a Google Form to import leads
 */
export const fetchGoogleFormResponses = async (formId: string) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Se requiere autenticación con Google para consultar Google Forms.');
  }

  const res = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}/responses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || 'No se pudo acceder al formulario de Google. Verifica el ID del formulario.');
  }

  return await res.json();
};
