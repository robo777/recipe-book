// src/routes/dashboard/+layout.js
export async function load() {
	console.log('Dashboard layout.js: load running');
	//const parentData = await parent(); // Gets { user, siteName }

	const dashboardSpecificData = {
		sectionTitle: 'Dashboard Control Panel',
		quickLinks: [
			{ href: '/dashboard/recipes', label: 'Recipes' },
			{ href: '/dashboard', label: 'Recipe Creator' },
			{ href: '/dashboard/ingredients', label: 'Ingredients' },
			{ href: '/dashboard/admin', label: 'Admin' },
			{ href: '/dashboard/schedule', label: 'Schedule' }
		]
	};

	return {
		// Merged with parentData automatically by SvelteKit
		...dashboardSpecificData
	};
}
