import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebaseAdmin';

export async function POST({ request, cookies }) {
	try {
		const { token } = await request.json();
		if (!token) {
			return json({ message: 'Missing token' }, { status: 400 });
		}

		// Verify the ID token while checking if the token is revoked.
		// The second parameter sets checkRevoked to true.
		const decodedToken = await adminAuth.verifyIdToken(token, true);

		// Determine session expiration based on Firebase token expiration
		// Firebase tokens last 1 hour by default. Use a longer cookie if needed,
		// but you'll need refresh logic or rely on client-side `onAuthStateChanged`.
		// For simplicity, match Firebase token duration (in seconds).
		const expiresIn = 60 * 60 * 1000; // 1 hour in milliseconds
		const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

		const options = {
			maxAge: expiresIn / 1000, // maxAge is in seconds
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			path: '/',
			sameSite: 'lax', // Adjust as needed (e.g., 'strict')
		};

		cookies.set('session', sessionCookie, options);

		return json({ status: 'signedIn', userId: decodedToken.uid });
	} catch (error) {
		console.error('Session Login Error:', error);
		let message = 'Session login failed.';
		if (error.code === 'auth/id-token-revoked') {
			message = 'Token revoked. Please sign in again.';
		} else if (error.code === 'auth/id-token-expired') {
			message = 'Token expired. Please sign in again.';
		}
		// IMPORTANT: Don't expose too much detail about internal errors
		return json({ message }, { status: 401 }); // Unauthorized
	}
}