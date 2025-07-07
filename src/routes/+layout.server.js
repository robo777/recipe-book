// src/routes/+layout.server.js
export async function load({ locals }) {
	// locals.user is populated by the hooks.server.js handle function
	const user = locals.user;
	// console.log('Root layout.server.js load, user:', user);
	return {
		// Pass minimal user data needed by layouts/pages
		user: user ? { uid: user.uid, name: user.name || user.email, email: user.email } : null,
		siteName: 'Recipe Book',
	};
}