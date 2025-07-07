<script>
	import { db } from '$lib/client/firebase';
	import { doc,setDoc } from 'firebase/firestore';

	let {
		searchTerm,
		selectedCategory,
		categories,
		recipes,
		id,
		selRecipe,
		showForm,
		recipeId,
		viewDetails,

		isActive,
		index
	} = $props();

	// Filtered recipes using rune
	let filteredRecipes = $derived(() => {
		return recipes.filter((recipe) => {
			const matchesSearch = recipe.details.name.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory =
				selectedCategory === 'All' || recipe.details.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	});

	async function schedule(recipe) {
		recipe.details.planned = !recipe.details.planned;

		// find id of recipe
		let recipeId = recipe.id

		console.log('is tog', recipe.details.isToggled, recipeId);
		const updatedStatus = {
			details: {
				planned: recipe.details.planned
				
			}
		};
		const userDocRef = doc(db, 'meals', recipeId);
		await setDoc(userDocRef, updatedStatus, { merge: true });
	}
</script>

{#if !showForm}
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="mx-auto max-w-6xl px-4">
			<!-- Header -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-4xl font-bold text-gray-900">Recipe Finder</h1>
				<p class="text-gray-600">Search and filter through our delicious recipe collection</p>
			</div>

			<!-- Search and Filter Controls -->
			<div class="mb-8 rounded-lg bg-white p-6 shadow-md">
				<div class="flex flex-col gap-4 md:flex-row">
					<!-- Search Bar -->
					<div class="flex-1">
						<label for="search" class="mb-2 block text-sm font-medium text-gray-700">
							Search Recipes
						</label>
						<input
							id="search"
							type="text"
							bind:value={searchTerm}
							placeholder="Search by recipe name..."
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Category Filter -->
					<div class="md:w-48">
						<label for="category" class="mb-2 block text-sm font-medium text-gray-700">
							Category
						</label>
						<select
							id="category"
							bind:value={selectedCategory}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						>
							<option value="All">All Categories</option>
							{#each categories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>

					<!-- Active Filters Display -->
					{#if searchTerm || selectedCategory !== 'All'}
						<div class="mt-4 flex flex-wrap gap-2">
							<span class="text-sm text-gray-600">Active filters:</span>
							{#if searchTerm}
								<span
									class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
								>
									Search: "{searchTerm}"
									<button
										onclick={() => (searchTerm = '')}
										class="ml-2 text-blue-600 hover:text-blue-800"
									>
										×
									</button>
								</span>
							{/if}
							{#if selectedCategory !== 'All'}
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
								>
									Category: {selectedCategory}
									<button
										onclick={() => (selectedCategory = 'All')}
										class="ml-2 text-green-600 hover:text-green-800"
									>
										×
									</button>
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Results Count -->
			<div class="mb-4">
				<p class="text-gray-600">
					Showing {filteredRecipes().length} of {recipes.length} recipes
				</p>
			</div>

			<!-- Recipe Cards -->
			<div>
				{#if filteredRecipes().length > 0}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredRecipes() as recipe, index (recipe.id)}
							<div
								class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
							>
								<!-- Card Image -->
								<div class="relative h-48 overflow-hidden">
									<img
										src={recipe.images[0]['url']}
										alt={recipe.name}
										class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
									/>
									<span
										class="bg-opacity-90 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm"
									>
										<div class="badge badge-neutral">{recipe.details.category}</div>
									</span>
								</div>

								<!-- Card Body -->
								<div class="p-6">
									<h3 class="mb-3 text-xl font-bold text-gray-900">{recipe.details.name}</h3>

									<div class="space-y-3">
										<!-- Cook Time -->
										<div class="flex items-center">
											<span class="mr-2 text-sm text-gray-500">Category:</span>
											<div class="flex items-center text-gray-700">
												<span class="mr-1"></span>
												<span class="font-medium">{recipe.details.category}</span>
											</div>
										</div>

										<!-- Cook Time -->
										<div class="flex items-center">
											<span class="mr-2 text-sm text-gray-500">Feeds:</span>
											<div class="flex items-center text-gray-700">
												<span class="mr-1"></span>
												<span class="font-medium">{recipe.details.feeds}</span>
											</div>
										</div>

										<!-- Difficulty -->
										<div class="flex items-center">
											<span class="mr-2 text-sm text-gray-500">Rating:</span>
											<div class="flex items-center text-gray-700">
												<span class="mr-1"></span>
												<span class="font-medium">{recipe.details.rating} / 10 </span>
											</div>
										</div>

										<!-- Action Button -->
										<div class=" flex items-center">
											<span>
												<button
													class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
													onclick={() => viewDetails(recipe.id)}
												>
													View Recipe
												</button>
											</span>
											<span>
												<div class=" flex items-center">
													<button
														class="ml-3 w-full rounded-lg px-4 py-2 font-small text-white transition-colors duration-200
														
														{recipe.details.planned
															? 'bg-green-600 hover:bg-green-500'
															: 'bg-purple-600 hover:bg-purple-500'}"
														onclick={() => schedule(recipe)}
													>	{recipe.details.planned
														?'Scheduled'
														:'Schedule'}
													</button>
												</div></span
											>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-lg bg-white py-12 text-center shadow-md">
						<div class="mb-4 text-6xl text-gray-400">🔍</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No recipes found</h3>
						<p class="text-gray-500">Try adjusting your search terms or filters</p>
						<button
							onclick={() => {
								searchTerm = '';
								selectedCategory = 'All';
							}}
							class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Clear all filters
						</button>
					</div>
				{/if}
			</div>

			<!-- Quick Category Buttons -->
			<div class="mt-8">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Quick Category Filter</h3>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => (selectedCategory = 'All')}
						class="rounded-lg px-4 py-2 transition-colors {selectedCategory === 'All'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
					>
						All
					</button>
					{#each categories as category}
						<button
							onclick={() => (selectedCategory = category)}
							class="rounded-lg px-4 py-2 transition-colors {selectedCategory === category
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						>
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
