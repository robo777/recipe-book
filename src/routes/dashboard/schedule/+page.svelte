<script>
	import { db } from '$lib/client/firebase';
	import { doc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
	import { tick } from 'svelte';

	let planRecipes = $state([]);
	let plannedRecipes = $state([])
	let planIngredients = $state([]);
	let result = $state([]);
	let allIngredients = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
    let summedMap = $state([]);
    let trigger = $state('');

	// Use $effect to run code when the component mounts (like a side-effect)
	$effect.pre(() => {
             console.log(trigger)
		const fetchPlannedRecipes = async () => {
       
			try {
				// 1. Create a reference to the 'tasks' collection
				const tasksCollection = collection(db, 'meals');

				// 2. Create the query to get documents where 'planned' is true
				const q = query(tasksCollection, where('details.planned', '==', true));

				// 3. Execute the query
				const querySnapshot = await getDocs(q);

				// 4. Process the results
				 plannedRecipes = [];
				querySnapshot.forEach((doc) => {
					// doc.data() is the object { name: '...', planned: ... }
					// We add the document ID for good measure
					plannedRecipes.push({ id: doc.id, ...doc.data() });
				});

				console.log('planned recipes', plannedRecipes);

				// 5. Update our reactive state

				// set planned recipe info
				for (let i = 0; i < plannedRecipes.length; i++) {
					planRecipes.push({
						id: plannedRecipes[i]['id'],
						name: plannedRecipes[i]['details']['name'],
						url: plannedRecipes[i]['images'][0]['url']
					});
				}

				// get ingredient shopping list
				for (let i = 0; i < plannedRecipes.length; i++) {
					planIngredients.push({
						ingreds: plannedRecipes[i]['ingredients']
					});
				}

				allIngredients = planIngredients.flatMap((item) => item.ingreds);
				 summedMap = new Map();
				allIngredients.forEach((item) => {
					if (summedMap.has(item.ingredname)) {
						const existing = summedMap.get(item.ingredname);
						existing.quantity += item.quantity;
					} else {
						summedMap.set(item.ingredname, { ...item });
					}
				});

				result = Array.from(summedMap.values());
				console.log('\nMethod 2 - Using Map:');
				console.log(result);

				console.log('planned recipes', planRecipes);
				//console.log('planned ingredients', planIngredients);
				//console.log('summed ingredients', summed);
			} catch (e) {
				console.error('Error fetching documents: ', e);
				error = e.message;
			} finally {
				isLoading = false;
			}
		};

		fetchPlannedRecipes();
	});
    // CANCEL SCHEDULED ITEM
	async function deleteRecipe(id, index) {
		console.log('del id',index);
		let planned = false;
		const updatedStatus = {
			details: {
				planned: planned
			}
		};
		const userDocRef = doc(db, 'meals', id);
		await setDoc(userDocRef, updatedStatus, { merge: true });

		console.log("panRecipes", planRecipes)

		planRecipes.splice(index, 1);
			plannedRecipes.splice(index, 1);

		console.log("planned recipes", plannedRecipes)
		planIngredients = [];
		for (let i = 0; i < plannedRecipes.length; i++) {
					planIngredients.push({
						ingreds: plannedRecipes[i]['ingredients']
					});
				}

				console.log("planIngredients", planIngredients)

				allIngredients = planIngredients.flatMap((item) => item.ingreds);
				 summedMap = new Map();
				allIngredients.forEach((item) => {
					if (summedMap.has(item.ingredname)) {
						const existing = summedMap.get(item.ingredname);
						existing.quantity += item.quantity;
					} else {
						summedMap.set(item.ingredname, { ...item });
					}
				});
				result = [];
				result = Array.from(summedMap.values());
				console.log('\nMethod 2 - Using Map:');
				console.log("result",result);

        
	}
</script>

Schedule in progress
<div class="min-h-screen bg-gray-50 p-2">
	<div class="mx-auto max-w-6xl">
		<div class="gap- grid grid-cols-1 md:grid-cols-2">
			<!-- Left Container -->
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h2 class="mb-4 text-2xl font-bold text-gray-800">Planned Recipes</h2>
				<div class="space-y-3">
					{#each planRecipes as recipe, index}
						<div class="flex h-20 items-center rounded border-l-4 border-blue-500 bg-blue-50 p-1">
							<span
								><img
									src={recipe.url}
									alt={recipe.name}
									class="justify-left h-20 object-cover transition-transform duration-300"
								/></span
							>
							<span class={'ml-5'}>{recipe.name}</span>
							<button
								onclick={() => deleteRecipe(recipe.id,index)}
								class="ml-18 rounded bg-red-500 p-1 py-1 text-sm text-white hover:bg-red-600"
							>
								Cancel
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right Container -->
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h2 class="mb-4 text-2xl font-bold text-gray-800">Ingredients Required</h2>
				<div class="space-y-3">
					{#each result as ingred}
						<div class="h-8 items-center rounded border-l-4 border-green-500 bg-green-50 p-1">
							{ingred.ingredname}
							{ingred.quantity} ({ingred.ingreduom})
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
