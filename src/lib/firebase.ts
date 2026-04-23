import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Usamos el ID de base de datos específico proporcionado en la configuración
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Función para probar la conexión (Constraint crítica)
export async function testConnection() {
  try {
    // Intentamos leer un documento inexistente para verificar conectividad
    // Esto disparará un error de permisos por las reglas de seguridad strictas, 
    // lo cual confirma que estamos conectados y protegidos.
    await getDocFromServer(doc(db, 'system', 'health'));
    console.log('Firebase connection: OK (Public document access found)');
  } catch (error: any) {
    if (error.code === 'permission-denied' || (error.message && error.message.includes('permission-denied'))) {
      console.log('Firebase connection: OK (Secure connection verified with restricted access)');
    } else {
      console.error('Firebase connection error:', error.message || error);
    }
  }
}

// Helper para errores de Firestore (Constraint crítica)
export function handleFirestoreError(error: any) {
  const errorInfo = {
    error: error.message || 'Unknown error',
    operationType: 'write',
    path: error.path || null,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'none',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      providerInfo: auth.currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  throw new Error(JSON.stringify(errorInfo));
}
