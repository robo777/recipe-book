<!-- src/routes/+page.svelte -->
<script>
	import RecipeIngreds from './recipe_ingreds.svelte';
	import Ingredients from './ingredients.svelte';
	import Method from './method.svelte';
	import Images from './images.svelte';
	import Description from './description.svelte';
	import Save_edit from './save_edit.svelte';
	import Test from './test.svelte';
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
		// change page title to Edit
		

		
		// delete if existing
			// localStorage.removeItem('desc');
			// localStorage.removeItem('method');
			// localStorage.removeItem('recipe');
			// localStorage.removeItem('images');
	




	});
</script>



<div class="container">
	<div class={'mb-6 text-3xl font-bold'}>
		<h1 class= 'text-gray-800'>Recipe Creator</h1>
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
		<button
			class="tab-button {activeTab === 'tab5' ? 'active' : ''}"
			onclick={() => setActiveTab('tab5')}
		>
			Save & Edit
		</button>
		<button
			class="tab-button {activeTab === 'tab6' ? 'active' : ''}"
			onclick={() => setActiveTab('tab6')}
		>
			Test
		</button>
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
		{:else if activeTab === 'tab5'}
			<div class="tab-panel">
				<Save_edit />
			</div>
		{:else if activeTab === 'tab6'}
			<div class="tab-panel">
				<Test />
			</div>
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

	h2 {
		color: #1e293b;
		margin-bottom: 1rem;
	}

	p {
		/* color: #475569; */
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	ul {
		color: #475569;
		line-height: 1.6;
		margin-left: 1rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	code {
		background-color: #f1f5f9;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-family: 'Courier New', monospace;
		color: #e11d48;
	}

	.contact-info {
		background-color: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border-left: 4px solid #3b82f6;
	}

	.contact-info p {
		margin-bottom: 0.5rem;
	}

	.contact-info strong {
		color: #1e293b;
	}
</style>
