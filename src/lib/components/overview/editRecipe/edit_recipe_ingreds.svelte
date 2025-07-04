

<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { db } from '$lib/client/firebase';
	import {
		collection,
		doc,
		setDoc,
		getDocs,
		updateDoc,
		where,
		query,
		orderBy,
		onSnapshot
	} from 'firebase/firestore';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	// import { toasts, ToastContainer, FlatToast, BootstrapToast }  from "svelte-toasts";

   

	const ingredientRef = collection(db, 'ingredients');
	let ingredients = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let recipe = $state([]);
	let ingredcategory = $state('');
	let ingredname = $state('');
	let ingreduom = $state('');
	let quantity = $state('');
	let message = '';

	let recipes = [];
	// Recipe ingredients with quantities
	let recipeIngredients = $state([]);
	// Drag state
	let draggedItem = $state(null);
	// Search functionality
	let searchTerm = $state('');
	let editId = $state([]);

   

	//const ingredientsRef = collection(db, 'ingredients');
// const showToast = () => {
//     const toast = toasts.add({
//       title: 'Updated',
      
//       duration:3000, // 0 or negative to avoid auto-remove
//       placement: 'bottom-left',
//       type: 'success',
//       theme: 'light',
    
//       type: 'success',
      
//       onClick: () => {},
//       onRemove: () => {},
//       // component: BootstrapToast, // allows to override toast component/template per toast
//     });

//     // toast.remove()

//   };
   

	const saved = localStorage.getItem('editId');

	editId = saved;

	onMount(() => {
		const fetchData = async () => {
			try {
				loading = true;

				const [ingredientsSnapshot] = await Promise.all([getDocs(collection(db, 'ingredients'))]);
				const [recipesSnapshot] = await Promise.all([getDocs(collection(db, 'meals'))]);

				ingredients = ingredientsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));

				recipes = recipesSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));
			} catch (err) {
				error = err.message;
				console.error('Error fetching data:', err);
			} finally {
				loading = false;
			}

			console.log('cats', ingredients);
			console.log('recipes', recipes);
			console.log('editId', editId);

			const findRecipe = JSON.parse(editId);

			let filteredData = recipes.filter((item) => item.id === findRecipe);
			let data = $state(filteredData[0]['ingredients']);
			console.log('data', data);

			for (let i = 0; i < data.length; i++) {
				recipeIngredients.push({
					id: data[i]['id'],
					ingredname: data[i]['ingredname'],
					quantity: data[i]['quantity'],
					ingreduom: data[i]['ingreduom'],
					ingredcategory: data[i]['ingredcategory']
				});
			}

			console.log('recipeIngredients', recipeIngredients);
			// localStorage.setItem('details', JSON.stringify({ name }));
		};

		fetchData();
	});

	// Filtered ingredients based on search
	const filteredIngredients = $derived(
		ingredients.filter((ingredient) =>
			ingredient.ingredname.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	function handleDragStart(event, ingredient) {
		draggedItem = ingredient;
		event.dataTransfer.effectAllowed = 'copy';
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}

	function handleDrop(event) {
		event.preventDefault();

		if (draggedItem) {
			// Check if ingredient already exists in recipe
			const existingIndex = recipeIngredients.findIndex((item) => item.id === draggedItem.id);

			if (existingIndex === -1) {
				// Add new ingredient with default quantity
				recipeIngredients.push({
					...draggedItem,
					quantity: 1
				});
				logRecipeToConsole();
				console.log('drag output', JSON.stringify(recipeIngredients));
			}
		}

		draggedItem = null;
	}

	function updateQuantity(ingredientId, quantity) {
		const index = recipeIngredients.findIndex((item) => item.id === ingredientId);
		if (index !== -1) {
			recipeIngredients[index].quantity = quantity;
			logRecipeToConsole();
		}
	}

	function removeIngredient(ingredientId) {
		recipeIngredients = recipeIngredients.filter((item) => item.id !== ingredientId);
		logRecipeToConsole();
	}

	function logRecipeToConsole() {
		const recipeOutput = {
			ingredients: recipeIngredients.map((item) => ({
				id: item.id,
				ingredname: item.ingredname,
				quantity: item.quantity,
				ingreduom: item.ingreduom,
				ingredcategory: item.ingredcategory
			}))
		};
		localStorage.setItem('recipe', JSON.stringify(recipeOutput.ingredients));
		console.log('Recipe JSON Output:', JSON.stringify(recipeOutput, null, 2));
	}

   

	async function updateRecipe() {
		const docRef = doc(db, 'meals', JSON.parse(editId));

		await updateDoc(
			docRef,
			{
				ingredients: recipeIngredients
			},

			{ merge: true }
		);

		//showToast()
		
	}
</script>



<main class="container mx-auto p-6">
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Left Box - Available Ingredients -->
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-700">Available Ingredients</h2>

			<!-- Search Input -->
			<div class="mb-4">
				<label for="ingredient-search" class="mb-2 block text-sm font-medium text-gray-600">
					Search Ingredients
				</label>
				<input
					id="ingredient-search"
					type="text"
					bind:value={searchTerm}
					placeholder="Type to search ingredients..."
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="grid grid-cols-2 gap-3">
				{#each filteredIngredients as ingredient (ingredient.id)}
					<div
						class="cursor-grab rounded-lg border-2 border-blue-200 bg-blue-50 p-3 transition-colors duration-200 hover:bg-blue-100 active:cursor-grabbing"
						draggable="true"
						ondragstart={(e) => handleDragStart(e, ingredient)}
						role="button"
						tabindex="0"
						aria-label="Drag {ingredient.ingredname} to recipe"
					>
						<div class="text-sm font-medium text-blue-800">{ingredient.ingredname}</div>
						<div class="text-xs text-blue-600">({ingredient.ingreduom})</div>
					</div>
				{/each}
			</div>

			{#if filteredIngredients.length === 0 && searchTerm}
				<div class="mt-4 rounded-lg bg-yellow-50 p-3">
					<p class="text-sm text-yellow-700">No ingredients found matching "{searchTerm}"</p>
				</div>
			{/if}

			<div class="mt-4 rounded-lg bg-gray-50 p-3">
				<p class="text-sm text-gray-600">💡 Drag ingredients to your recipe box!</p>
			</div>
		</div>

		<!-- Right Box - Recipe -->
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-700">Your Recipe</h2>

			<!-- Drop Zone -->
			<div
				class="min-h-64 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors duration-200"
				class:border-green-400={draggedItem}
				class:bg-green-50={draggedItem}
				ondragover={handleDragOver}
				ondrop={handleDrop}
				role="region"
				aria-label="Recipe drop zone"
				aria-describedby="drop-zone-instructions"
			>
				{#if recipeIngredients.length === 0}
					<div class="flex h-32 items-center justify-center text-gray-500">
						<div class="text-center">
							<div class="mb-2 text-4xl">🍽️</div>
							<p id="drop-zone-instructions">Drop ingredients here to build your recipe</p>
						</div>
					</div>
				{:else}
					<div class="space-y-3" role="list" aria-label="Recipe ingredients">
						{#each recipeIngredients as recipeItem (recipeItem.id)}
							<div
								class="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
								role="listitem"
							>
								<div class="flex-1">
									<h3 class="font-medium text-green-800">{recipeItem.ingredname}</h3>
									<div class="mt-2 flex items-center gap-2">
										<label for="quantity-{recipeItem.id}" class="text-sm text-green-600"
											>Quantity:</label
										>
										<input
											id="quantity-{recipeItem.id}"
											type="number"
											min="0.1"
											step="0.1"
											value={recipeItem.quantity}
											oninput={(e) =>
												updateQuantity(recipeItem.id, parseFloat(e.target.value) || 0)}
											class="w-20 rounded border border-green-300 px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
											aria-label="Quantity of {recipeItem.name} in {recipeItem.ingreduom}"
										/>
										<span class="text-sm text-green-600">{recipeItem.ingreduom}</span>
									</div>
								</div>
								<button
									onclick={() => removeIngredient(recipeItem.id)}
									class="ml-4 text-red-500 transition-colors duration-200 hover:text-red-700"
									title="Remove {recipeItem.ingredname} from recipe"
									aria-label="Remove {recipeItem.ingredname} from recipe"
								>
									✕
								</button>
							</div>
						{/each}
					</div>

					<!-- Recipe Summary -->
					<div>
						<button
							onclick={updateRecipe}
							class="col-start-1 row-start-1 mt-2 w-full rounded-md bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							aria-label="Add ingredient"
						>
							Update
						</button>
					</div>
					
					<!-- <div class="mt-6 rounded-lg bg-gray-50 p-4">
						<div class="mb-2 flex items-center justify-between">
							<h3 class="font-semibold text-gray-700">Recipe Summary:</h3>
							<button
								onclick={logRecipeToConsole}
								class="rounded bg-blue-500 px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-blue-600"
								title="Log recipe JSON to console"
							>
								📋 Log JSON
							</button>
						</div>
						<ul class="space-y-1 text-sm text-gray-600">
							{#each recipeIngredients as item}
								<li>• {item.quantity} {item.ingreduom} of {item.ingredname}</li>
							{/each}
						</ul>
						<div class="mt-2 text-xs text-gray-500">💡 Check browser console for JSON output</div>
					</div> -->
				{/if}
			</div>
		</div>
	</div>

    <!-- <ToastContainer placement="bottom-right" let:data={data}> -->
    <!-- <FlatToast {data} />  -->
  <!-- </ToastContainer> -->
</main>

<style>
	.container {
		max-width: 1200px;
	}

	/* Custom scrollbar for webkit browsers */
	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: #f1f1f1;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #c1c1c1;
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: #a8a8a8;
	}
</style>
