// src/lib/server/firebaseAdmin.js
import admin from 'firebase-admin';
import {
	FIREBASE_ADMIN_TYPE,
	FIREBASE_ADMIN_PROJECT_ID,
	FIREBASE_ADMIN_PRIVATE_KEY_ID,
	FIREBASE_ADMIN_PRIVATE_KEY,
	FIREBASE_ADMIN_CLIENT_EMAIL,
	FIREBASE_ADMIN_CLIENT_ID,
	FIREBASE_ADMIN_AUTH_URI,
	FIREBASE_ADMIN_TOKEN_URI,
	FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
	FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
} from '$env/static/private';


// Ensure private key newlines are correctly interpreted
const privateKey = FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert({
				type: FIREBASE_ADMIN_TYPE,
				project_id: FIREBASE_ADMIN_PROJECT_ID,
				private_key_id: FIREBASE_ADMIN_PRIVATE_KEY_ID,
				private_key: privateKey,
				client_email: FIREBASE_ADMIN_CLIENT_EMAIL,
				client_id: FIREBASE_ADMIN_CLIENT_ID,
				auth_uri: FIREBASE_ADMIN_AUTH_URI,
				token_uri: FIREBASE_ADMIN_TOKEN_URI,
				auth_provider_x509_cert_url: FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
				client_x509_cert_url: FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
			}),
		});
		console.log('Firebase Admin Initialized');
	} catch (error) {
		console.error('Firebase Admin Initialization Error:', error);
		// Optionally throw the error or handle it gracefully
		// throw new Error('Failed to initialize Firebase Admin SDK');
	}
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); // If using Firestore Admin functions