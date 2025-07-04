<!-- src/routes/dashboard/+page.svelte -->
<script>
	
	import RecipeBuildMainPage from '$lib/components/overview/createRecipe/recipe_tabbed_page.svelte'
	

	const date = new Date().toLocaleDateString('en-uk', {
		weekday: 'long',
		month: 'short',
		year: 'numeric',
		day: 'numeric'
	});
</script>

<!-- <h1 class="mb-8 text-center text-3xl font-bold text-gray-800 dark:text-white">
	recipe
</h1> -->
<!-- <RecipeIngreds/> -->
<RecipeBuildMainPage/>

