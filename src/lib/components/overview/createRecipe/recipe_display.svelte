<!-- +page.svelte -->
<script>





	let {
		exitDisplay,
		desc,
		ingredients,
		method,
		images,
		deleteRecipe,
		editRecipe,
		
	} = $props();

	


  function closeModal() {
    dispatch('close');
  }
	

	let currentImageIndex = $state(0);

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}

	function prevImage() {
		currentImageIndex =
			currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
	}

	function selectImage(index) {
		currentImageIndex = index;
	}
</script>



<main class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header Section -->
	<header class="mb-8">
		<div class="flex justify-end">
			<button
				onclick={() => exitDisplay()}
				class="  rounded-md bg-orange-300 px-4 py-2 font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
				aria-label="Exit">x</button
			>
		</div>
		<h1 class="mb-4 text-4xl font-bold text-gray-900">{desc.name}</h1>
		<p class="mb-6 text-lg text-gray-600">{desc.desc}</p>

		<!-- Recipe Meta Info -->
		<div class="mb-6 rounded-lg bg-gray-50 p-6">
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div>
					<dt class="text-sm font-medium text-gray-500">Category</dt>
					<dd class="text-lg font-semibold text-gray-900">{desc.category}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-500">Book</dt>
					<dd class="text-lg font-semibold text-gray-900">{desc.book}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-500">Planned</dt>
					<dd class="text-lg font-semibold text-gray-900">{desc.planned}</dd>
				</div>
				
			</div>

			<div class="mt-4 flex items-center gap-10 border-t border-gray-200 pt-4">
				
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-gray-500">Rating:</span>
					<span class="text-yellow-500">★★★★★</span>
					<span class="text-sm text-gray-600">({desc.rating}/10)</span>
				</div>
				
				<div class="flex items-  gap-5 justify-end">
					<button
				onclick={() => deleteRecipe()}
				class="  rounded-md bg-slate-300 px-2 py-2 font-small text-slate-50 transition-colors duration-200 hover:bg-red-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
				aria-label="Exit">Delete</button
			>
					
				</div>

				<div class="flex items-  gap-5 justify-end">
					<button
				onclick={() => editRecipe()}
				class="  rounded-md bg-orange-300 px-2 py-2 font-small text-slate-50 transition-colors duration-200 hover:bg-green-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
				aria-label="Exit">Edit</button
			>
					
				</div>
				
			</div>
		</div>
	</header>

	<!-- Image Gallery -->
	<section class="mb-8" aria-labelledby="images-heading">
		<h2 id="images-heading" class="sr-only">Recipe Images</h2>

		<div class="relative mb-4">
			<img
				src={images[currentImageIndex].url}
				alt={images[currentImageIndex].alt}
				class="h-96 w-full rounded-lg object-cover shadow-lg"
			/>

			{#if images.length > 1}
				<button
					onclick={prevImage}
					class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black p-2 text-white transition-all"
					aria-label="Previous image"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
				</button>

				<button
					onclick={nextImage}
					class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black p-2 text-white transition-all"
					aria-label="Next image"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
						></path>
					</svg>
				</button>
			{/if}
		</div>

		{#if images.length > 1}
			<div class="flex justify-center gap-2" role="tablist" aria-label="Recipe image gallery">
				{#each images as image, index}
					<button
						onclick={() => selectImage(index)}
						class="h-20 w-20 overflow-hidden rounded-lg border-2 transition-all {currentImageIndex ===
						index
							? 'border-blue-500'
							: 'border-gray-200 hover:border-gray-300'}"
						role="tab"
						aria-selected={currentImageIndex === index}
						aria-label="View image {index + 1}"
					>
						<img src={image.url} alt="" class="h-full w-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Main Content Grid -->
	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Ingredients -->
		<section class="lg:col-span-1" aria-labelledby="ingredients-heading">
			<div class="sticky top-4 rounded-lg border border-gray-200 bg-white p-6">
				<h2 id="ingredients-heading" class="mb-4 text-2xl font-bold text-gray-900">Ingredients</h2>

				<ul class="space-y-3" role="list">
					{#each ingredients as ingredient}
						<li class="flex items-start justify-between">
							<span class="text-gray-700">
								<strong class="text-gray-900">{ingredient.quantity} {ingredient.ingreduom}</strong>
								{ingredient.ingredname}
							</span>
						</li>
					{/each}
				</ul>

				
			</div>
		</section>

		<!-- Method -->
		<section class="lg:col-span-2" aria-labelledby="instructions-heading">
			<h2 id="instructions-heading" class="mb-6 text-2xl font-bold text-gray-900">Instructions</h2>

			<ol class="space-y-6" role="list">
				{#each method as instruction, index}
					<li class="flex gap-4">
						<span
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white"
						>
							{index + 1}
						</span>
						<div class="flex-1">
							<p class="leading-relaxed text-gray-700">{instruction.text}</p>
						</div>
					</li>
				{/each}
			</ol>

			
		</section>
	</div>
</main>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>
