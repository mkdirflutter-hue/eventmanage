import admin from "firebase-admin";

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_ADMIN_SDK_TYPE,
    projectId: process.env.FIREBASE_ADMIN_SDK_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_ADMIN_SDK_CLIENT_ID,
    authUri: process.env.FIREBASE_ADMIN_SDK_AUTH_URI,
    tokenUri: process.env.FIREBASE_ADMIN_SDK_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_ADMIN_SDK_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_ADMIN_SDK_CLIENT_X509_CERT_URL,
  }),
});

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
