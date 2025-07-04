<!-- src/routes/dashboard/+layout.svelte -->
<script>
	import { page } from '$app/stores';

	// Svelte 5: Access merged data AND the 'children' snippet for this layout level
	let { data, children } = $props(); // <-- Destructure 'children' here too

	// Helper function to check path matching
	function checkActive(href) {
		const currentPathname = $page.url.pathname;
		return currentPathname === href;
	}

	// Use $derived at the top level for active states
	let activeStates = $derived(
		data.quickLinks.reduce((acc, link) => {
			acc[link.href] = checkActive(link.href);
			return acc;
		}, {})
	);

</script>

<!-- Dashboard layout using flexbox and Tailwind classes -->
<div class="flex flex-col md:flex-row gap-4 lg:gap-6">

	<!-- Sidebar -->
	<aside class="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
		<h2 class="text-xl font-semibold mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
			{data.sectionTitle}
		</h2>
		<nav>
			<ul class="space-y-2">
				{#each data.quickLinks as link (link.href)}
					{@const active = activeStates[link.href]}
					<li>
						<a
							href={link.href}
							class="block rounded-md px-3 py-2 text-base font-medium transition-colors duration-150 ease-in-out"
							class:bg-blue-100={active}
							class:dark:bg-blue-900={active}
							class:text-blue-700={active}
							class:dark:text-blue-300={active}
							class:font-semibold={active}
							class:text-gray-700={!active}
							class:dark:text-gray-300={!active}
							class:hover:bg-gray-100={!active}
							class:dark:hover:bg-gray-700={!active}
							aria-current={active ? 'page' : undefined}
						>
							{link.label}
						</a>
					</li>
				{/each}

				{#if data.user}
					<li>
						<a
							href="/logout"
							class="mt-4 block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
						>
							<!--Logout ({data.user.name}) -->
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	</aside>

	<!-- Main dashboard content area where the page goes -->
	<div class="flex-grow  bg-white dark:bg-gray-800 rounded-lg shadow-md">
		<!-- Renders the specific dashboard page using the 'children' snippet -->
		{@render children()} <!-- <-- REPLACEMENT for <slot /> -->
	</div>

</div>