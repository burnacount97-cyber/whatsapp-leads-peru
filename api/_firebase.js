import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;

        if (serviceAccount) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        } else {
            // Fallback: This will attempt to use Google Application Default Credentials
            // or fail if not configured.
            initializeApp();
        }
    } catch (error) {
        console.error('Firebase Admin Init Error:', error);
    }
}

export const db = getFirestore();
