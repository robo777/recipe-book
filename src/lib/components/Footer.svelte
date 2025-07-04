<!-- src/lib/components/Footer.svelte -->
<script>
	// Svelte 5: Define expected props
	let { siteName } = $props();

	// Calculate year once
	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 text-center text-sm text-gray-600 dark:text-gray-400">
		© {currentYear} {siteName}. All rights reserved.
        <!-- Add other footer links or info if needed -->
        <!-- <a href="/privacy" class="ml-4 hover:underline">Privacy Policy</a> -->
	</div>
</footer>