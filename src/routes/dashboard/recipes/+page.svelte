<!-- src/routes/+page.svelte -->
<script>
	import { db } from '$lib/client/firebase';
	import {
		collection,
		doc,
		getDocs,
		addDoc,
		setDoc,
		deleteDoc,
		updateDoc,
		where,
		query,
		orderBy,
		onSnapshot
	} from 'firebase/firestore';
	import { onMount, tick } from 'svelte';

	import RecipeCards from '$lib/components/overview/createRecipe/recipeCards.svelte';
	import RecipeDisplay from '$lib/components/overview/createRecipe/recipe_display.svelte';
	import DeleteModal from '../modal/+page.svelte'
	import { goto } from '$app/navigation';

	let loading = $state(true);
	let error = $state(null);
	let recipes = $state([]);
	let categories = $state([]);
	let selRecipe = $state('');
	let recipeId = $state('');
	let showForm = $state(false);
	let showModal = $state(false);
	let show = $state(false);
	let btnCol = $state('bg-purple-500')
	let isActive = $state(true)


	let refreshTrigger = $state(0); // Used to trigger parent refresh

	// onMount(() => {
	//

	// });

	$effect(() => {
		// refreshTrigger.get(); // This line tracks the dependency
		const fetchData = async () => {
			try {
				loading = true;

				const [mealsSnapshot] = await Promise.all([getDocs(collection(db, 'meals'))]);

				let meals = [];

				meals = mealsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));

				console.log('meals', meals);

				recipes = meals;
				console.log('the component has mounted');
			} catch (err) {
				error = err.message;
				console.error('Error fetching data:', err);
			} finally {
				loading = false;
			}

			categories = [...new Set(recipes.map((recipe) => recipe.details.category))];
		};

		fetchData();
	});

	// Get unique categories

	// Runes for reactive state
	let searchTerm = $state('');
	let selectedCategory = $state('All');

	/// display full recipe controls

  


	

	function deleteRecipe() {
		console.log('delete rec');
		// show = true;
     goto('/dashboard/modal');
	}

	function editRecipe() {
		//console.log('products', products);
		console.log('edit rec', selRecipe);
		localStorage.setItem('editId', JSON.stringify(selRecipe[0]['id']));

		goto('/dashboard/edit_recipe');
	}

	async function viewDetails(id) {
		showForm = true;

		//let updatedRecipe = [];

		selRecipe = recipes.filter((item) => item.id === id);
		console.log('view product', selRecipe);
		recipeId = id;
    localStorage.setItem('delId', JSON.stringify(id));
	}

	function exitDisplay() {
		showForm = false;
	}

	

	function showDeleteModal() {
		console.log('open del modal');
		show = true;
	}

	// delete modal
	function handleConfirmModal() {
		handleDelete();
		show = false;
	}

	function handleCancelModal() {
		// onCancel?.();
		show = false;
	}
</script>

{#if !showForm}
	<RecipeCards
		{selectedCategory}
		{categories}
		{searchTerm}
		{selRecipe}
		{recipes}
	
		{viewDetails}
		{showForm}
		{isActive}
		
		
	/>
{/if}

{#if showForm}
	<RecipeDisplay
		{exitDisplay}
		{deleteRecipe}
		{editRecipe}
		desc={selRecipe[0].details}
		ingredients={selRecipe[0].ingredients}
		method={selRecipe[0].method}
		images={selRecipe[0].images}
	/>
{/if}

{#if show}
	<DeleteModal
		show={showDeleteModal}
		onConfirm={handleDelete}
		onCancel={handleCancel}
		{handleCancelModal}
		{handleConfirmModal}
		title="Delete Item"
		message="Are you sure you want to delete this item? This action cannot be undone."
		{deleteRecipe}
	/>
{/if}
