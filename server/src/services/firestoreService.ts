import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialized once using the service account JSON from .env.
// Used by analytics aggregation and any AI endpoint that needs to
// read the user's task/habit history server-side.
if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.warn("No FIREBASE_SERVICE_ACCOUNT_JSON provided, using default fallback.");
      initializeApp();
    }
  } catch (e) {
    console.warn("Firebase Admin init failed:", e);
  }
}

export const db = getApps().length ? getFirestore() : null as any;
