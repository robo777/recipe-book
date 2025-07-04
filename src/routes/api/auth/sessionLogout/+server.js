// src/routes/api/auth/sessionLogout/+server.js
import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
	// Clear the session cookie
	cookies.delete('session', { path: '/' });
	return json({ status: 'signedOut' });
}