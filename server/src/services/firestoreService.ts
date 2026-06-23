import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, credential } from "firebase-admin/app";

// Initialized once using the service account JSON from .env.
// Used by analytics aggregation and any AI endpoint that needs to
// read the user's task/habit history server-side.
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "{}");
  initializeApp({ credential: credential.cert(serviceAccount) });
}

export const db = getFirestore();
