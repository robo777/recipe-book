<!-- src/routes/+page.svelte -->

<script>
	import RecipeIngreds from './edit_recipe_ingreds.svelte';
	//import Ingredients from './editingredients.svelte';
	import Method from './edit_method.svelte';
	import Images from './edit_images.svelte';
	import Description from './edit_description.svelte';
	import Save_edit from './edit_save_edit.svelte';

	let activeTab = $state('tab1');
	import { onMount } from 'svelte';

	function setActiveTab(tab) {
		activeTab = tab;
	}

	let title = $state('Recipe Creator');
	let textColor = $state('text-gray-800');

	let isActive = $state(false);

	onMount(() => {
		// check if editId exists
		const editId = JSON.parse(localStorage.getItem('editId'));
		console.log("editId",editId)
		// change page title to Edit
		

		
		// delete if existing
			localStorage.removeItem('desc');
			localStorage.removeItem('method');
			localStorage.removeItem('recipe');
			localStorage.removeItem('images');
	




	});
</script>



<div class="container">
	<div class={'mb-6 text-3xl font-bold'}>
		<h1 class= 'text-orange-500'>Edit Recipe</h1>
	</div>

	<!-- Tab Navigation -->
	<div class="tab-nav">
		<button
			class="tab-button {activeTab === 'tab1' ? 'active' : ''}"
			onclick={() => setActiveTab('tab1')}
		>
			Description
		</button>
		<button
			class="tab-button {activeTab === 'tab2' ? 'active' : ''}"
			onclick={() => setActiveTab('tab2')}
		>
			Recipe Builder
		</button>
		<button
			class="tab-button {activeTab === 'tab3' ? 'active' : ''}"
			onclick={() => setActiveTab('tab3')}
		>
			Method
		</button>
		<button
			class="tab-button {activeTab === 'tab4' ? 'active' : ''}"
			onclick={() => setActiveTab('tab4')}
		>
			Images
		</button>
		<!-- <button
			class="tab-button {activeTab === 'tab5' ? 'active' : ''}"
			onclick={() => setActiveTab('tab5')}
		>
			Save & Edit
		</button> -->
		
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'tab1'}
			<div class="tab-panel">
				<Description />
			</div>
		{:else if activeTab === 'tab2'}
			<div class="tab-panel">
				<RecipeIngreds />
			</div>
		{:else if activeTab === 'tab3'}
			<div class="tab-panel">
				<Method />
			</div>
		{:else if activeTab === 'tab4'}
			<div class="tab-panel">
				<Images />
			</div>
		<!-- {:else if activeTab === 'tab5'}
			<div class="tab-panel">
				<Save_edit />
			</div> -->
		
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		text-align: center;

		margin-bottom: 2rem;
	}

	.tab-nav {
		display: flex;
		border-bottom: 2px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.tab-button {
		background: none;
		border: none;
		padding: 1rem 2rem;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		color: #64748b;
		border-bottom: 3px solid transparent;
		transition: all 0.2s ease;
	}

	.tab-button:hover {
		color: #334155;
		background-color: #f8fafc;
	}

	.tab-button.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
		background-color: #f8fafc;
	}

	.tab-content {
		min-height: 300px;
	}

	.tab-panel {
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}


</style>
