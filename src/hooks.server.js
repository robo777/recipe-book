import { adminAuth } from '$lib/server/firebaseAdmin';

export async function handle({ event, resolve }) {
	const sessionCookie = event.cookies.get('session');

	if (!sessionCookie) {
		// if there is no session cookie, the user is not logged in
		event.locals.user = null;
		return resolve(event);
	}

	try {
		// Verify the session cookie. checkRevoked = true ensures the cookie is validated against revocation.
		const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
		// console.log('Verified session cookie for:', decodedClaims.email);
		event.locals.user = {
			uid: decodedClaims.uid,
			email: decodedClaims.email,
			name: decodedClaims.name, // May not always be present
			// Add other claims you need, e.g., picture: decodedClaims.picture
		};
	} catch (error) {
		// Session cookie is invalid or expired. Force logout.
		// console.warn('Invalid session cookie:', error.code);
		event.locals.user = null;
		// Optionally delete the invalid cookie
		// event.cookies.delete('session', { path: '/' });
		console.log("error",error)
	}

	return resolve(event);
}