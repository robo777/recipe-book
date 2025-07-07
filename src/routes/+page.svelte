<!-- src/routes/+page.svelte -->
<script>
	// Svelte 5: Access props (including data from parent layouts)
	let { data } = $props();
	// data contains { user, siteName } from src/routes/+layout.server.js
</script>

<div class="space-y-6 text-center py-12">
	<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
		Welcome to <span class="text-blue-600 dark:text-blue-400">{data.siteName}</span>!
	</h1>

	<p class="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
		This is the homepage of our awesome application, built with SvelteKit 5 and styled using Tailwind CSS.
	</p>

	{#if data.user}
		<p class="text-lg text-gray-700 dark:text-gray-300">
			Glad to see you, <span class="font-semibold">{data.user.name}</span>!
		</p>
		<div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
			<div class="rounded-md shadow">
				<a href="/dashboard/recipes" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10">
					Go to Dashboard
				</a>
			</div>
			<!-- Add other primary actions if needed -->
		</div>
	{:else}
		<p class="text-lg text-gray-700 dark:text-gray-300">
			Get started by logging in or exploring the public areas.
		</p>
		<div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
			<div class="rounded-md shadow">
				<a href="/login" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800 md:py-4 md:text-lg md:px-10">
					Login
				</a>
			</div>
			<!-- Optional secondary action -->
			<!-- <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
				<a href="/learn-more" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 md:py-4 md:text-lg md:px-10">
					Learn More
				</a>
			</div> -->
		</div>
	{/if}

	<!-- Example of displaying data passed from layout -->
	<!-- <div class="mt-10 text-sm text-gray-500 dark:text-gray-500">
		(Data from layout: User={data.user ? data.user.name : 'null'}, Site={data.siteName})
	</div> -->
</div>

     
  
   