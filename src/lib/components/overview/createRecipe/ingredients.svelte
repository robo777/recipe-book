<script>
	import { db } from '$lib/client/firebase';
	import {
		collection,
		doc,
        getDocs,
		addDoc,
		setDoc,
		deleteDoc,
		where,
		query,
		orderBy,
		onSnapshot
	} from 'firebase/firestore';

   
// get recipe categories and uom options from firebase
	
  

  let uoms = $state([]);
  let ingCats = $state([]);
    let ingredients = $state([]);
	  let categories = $state([]);
	    let uomOptions = $state([]);
  let loading = $state(true);
  let error = $state(null);

  $effect(() => {
    const fetchData = async () => {
      try {
        loading = true;
        
        const [uomsSnapshot, ingCatsSnapshot, ingredientsSnapshot] = await Promise.all([
          getDocs(collection(db, 'uoms')),
          getDocs(collection(db, 'ingred_cat')),
		  getDocs(collection(db, 'ingredients'))
        ]);

        uomOptions = uomsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        categories = ingCatsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

		ingredients = ingredientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      } catch (err) {
        error = err.message;
        console.error('Error fetching data:', err);
      } finally {
        loading = false;
      }
    //   console.log('uoms',uomOptions)
    //     console.log('cats',categories)
	// 	console.log('ingredientsxx',ingredients)
    };

    fetchData();
  });



	let searchTerm = $state('');
	let newIngredient = $state({
		ingredname: '',
		ingredcategory: '',
		ingreduom: '',
		ingredsupplier: ''
	});
	let editingId = $state(null);
	let editForm = $state({ ingredname: '', ingredcategory: '', ingreduom: '', ingredsupplier: '' });

	let nextId = $state(4);

	const filteredIngredients = $derived(
		ingredients.filter(
			(ingredient) =>
				ingredient.ingredname.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ingredient.ingredcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ingredient.ingreduom.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ingredient.ingredsupplier.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	async function addIngredient(e) {
		e.preventDefault();
		if (
			newIngredient.ingredname.trim() &&
			newIngredient.ingredcategory.trim() &&
			newIngredient.ingreduom.trim()
		) {
			//console.log('add clicked');

			const docRef = await addDoc(collection(db, 'ingredients'), {
				ingredname: newIngredient.ingredname,
				ingredcategory: newIngredient.ingredcategory,
				ingredsupplier: newIngredient.ingredsupplier,
				ingreduom: newIngredient.ingreduom
			});
		}
	}

	async function deleteIngredient(id) {
		const docRef = doc(db, 'ingredients', id);
		await deleteDoc(docRef);
	}

	function startEdit(ingredient) {
		editingId = ingredient.id;
		editForm.ingredname = ingredient.ingredname;
		editForm.ingredcategory = ingredient.ingredcategory;
		editForm.ingreduom = ingredient.ingreduom;
		editForm.ingredsupplier = ingredient.ingredsupplier;

		//console.log('start id', editingId);
		//console.log('editForm', editForm);
	}

	async function saveEdit() {
		if (editForm.ingredname.trim() && editForm.ingredcategory.trim() && editForm.ingreduom.trim()) {
			//const index = ingredients.findIndex(ing => ing.id === editingId);
			console.log('index', editingId);

			const docRef = doc(db, 'ingredients', editingId);

			await setDoc(
				docRef,
				{
					ingredname: editForm.ingredname,
					ingredcategory: editForm.ingredcategory,
					ingredsupplier: editForm.ingredsupplier,
					ingreduom: editForm.ingreduom
				},
				{ merge: true }
			);

			cancelEdit();
		}
	}

	function cancelEdit() {
		editingId = null;
		editForm.ingredname = '';
		editForm.ingredcategory = '';
		editForm.ingreduom = '';
		editForm.ingredsupplier = '';
	}
</script>

<div class="mx-auto max-w-4xl bg-white p-6">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">Ingredients Manager</h1>

	<!-- Add New Ingredient Form -->
	<div class="mb-8 rounded-lg bg-gray-50 p-6">
		<h2 class="mb-4 text-xl font-semibold text-gray-700">Add New Ingredient</h2>
		<form onsubmit={addIngredient} class="p-1">
			<div>
				<input
					type="text"
					bind:value={newIngredient.ingredname}
					placeholder="Ingredient name"
					class="col-start-1 row-start-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Ingredient name"
				/>
			</div>
			<div>
				<select
					bind:value={newIngredient.ingredcategory}
					class="col-start-1 row-start-1 mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Ingredient category"
				>
					<option value="">Select category</option>
					{#each categories as category}
						<option value={category.category}>{category.category}</option>
					{/each}
				</select>
			</div>
			<div>
				<select
					bind:value={newIngredient.ingreduom}
					class=" col-start-1 row-start-1 mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Unit of measure"
				>
					<option value="">Select UoM</option>
					{#each uomOptions as uom}
						<option value={uom.uomname}>{uom.uomname}</option>
					{/each}
				</select>
			</div>
			<div>
				<input
					type="text"
					bind:value={newIngredient.ingredsupplier}
					placeholder="Supplier (optional)"
					class=" col-start-1 row-start-1 mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Supplier"
				/>
			</div>
			<div>
				<button
					type="submit"
					class="col-start-1 row-start-1 mt-2 w-full rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Add ingredient"
				>
					Add
				</button>
			</div>
		</form>
	</div>

	<!-- Search -->
	<div class="mb-6">
		<input
			type="text"
			bind:value={searchTerm}
			placeholder="Search ingredients..."
			class="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			aria-label="Search ingredients"
		/>
	</div>

	<!-- Ingredients List -->
	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
		<div class="border-b border-gray-200 bg-gray-100 px-6 py-3">
			<h2 class="text-lg font-semibold text-gray-700">
				Ingredients ({filteredIngredients.length})
			</h2>
		</div>

		{#if filteredIngredients.length === 0}
			<div class="px-6 py-8 text-center text-gray-500">
				{searchTerm ? 'No ingredients found matching your search.' : 'No ingredients added yet.'}
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each filteredIngredients as ingredient, index (ingredient.id)}
					<div class="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
						{#if editingId === ingredient.id}
							<!-- Edit Form -->
							<div class="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<input
									type="text"
									bind:value={editForm.ingredname}
									class="rounded border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									aria-label="Edit ingredient name"
								/>
								<select
									bind:value={editForm.ingredcategory}
									class="rounded border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									aria-label="Edit ingredient category"
								>
									<option value="">Select category</option>
									{#each categories as category}
										<option value={category}>{category}</option>
									{/each}
								</select>
								<select
									bind:value={editForm.ingreduom}
									class="rounded border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									aria-label="Edit unit of measure"
								>
									<option value="">Select UoM</option>
									{#each uomOptions as uom}
										<option value={uom}>{uom}</option>
									{/each}
								</select>
								<input
									type="text"
									bind:value={editForm.ingredsupplier}
									class="rounded border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									aria-label="Edit supplier"
								/>
								<div class="col-span-full flex gap-2 sm:col-span-1">
									<button
										onclick={saveEdit}
										class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
										aria-label="Save changes"
									>
										Save
									</button>
									<button
										onclick={cancelEdit}
										class="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
										aria-label="Cancel editing"
									>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<!-- Display Mode -->
							<div class="flex-1">
								<div class="font-medium text-gray-900">{ingredient.ingredname}</div>
								<div class="flex flex-wrap gap-4 text-sm text-gray-500">
									<span>Category: {ingredient.ingredcategory}</span>
									<span>UoM: {ingredient.ingreduom}</span>
									<span>Supplier: {ingredient.ingredsupplier}</span>
								</div>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => startEdit(ingredient)}
									class="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									aria-label="Edit {ingredient}"
								>
									Edit
								</button>
								<button
									onclick={() => deleteIngredient(ingredient.id)}
									class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
									aria-label="Delete {ingredient.ingredname}"
								>
									Delete
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
