<script>
	import Card from '../lib/Card.svelte';
	
	// import cardsData from '../lib/card_data.svelte';
	// Import the reusable Card component
	import Data from '../lib/card_data.js'; // Adjust path if necessary

	// Sample data for our 5 cards (remains the same)
	let cardsData = $state(Data);

	
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-center text-3xl font-semibold text-gray-800">
		My Awesome Cards (Svelte 5 + Tailwind)
	</h1>

	<!-- Responsive Grid Layout using Tailwind -->
	<div
		class="
       
        /* Gap between items */ /* 1
        column by default */ /* 2 columns
        on small screens and up */ /* 3 columns on
        large screens and up */ /* 4 columns on extra-large
        screens and up */ /* 5 columns on 2xl screens
        and up */ grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
       "
	>
		{#each cardsData as card (card.id)}
			<Card data={card} themeColor={card.theme} />
		{/each}
	</div>
</div>
