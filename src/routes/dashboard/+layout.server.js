// src/routes/dashboard/+layout.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
	const user = locals.user;

	if (!user) {
		// Redirect to login if not authenticated
		// Include the intended destination for redirect after login
		throw redirect(307, `/login?redirectTo=${url.pathname}`);
	}

	// User is logged in, proceed to load dashboard-specific data
	// Parent data (like user from root layout) is automatically available

	// No need to explicitly return user here if root layout already does
	// Just load data specific to this layout level

	const dashboardSpecificData = {
		sectionTitle: 'Dashboard Control Panel',
		quickLinks: [
			{ href: '/dashboard', label: 'Overview' },
			{ href: '/dashboard/recipes', label: 'Recipes' },
		],
	};

	return {
		// Merged automatically with parent data by SvelteKit
		...dashboardSpecificData,
	};
}