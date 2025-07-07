<!-- +page.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { db } from '$lib/client/firebase';
	import {
		collection,
		doc,
		updateDoc,
		getDocs,
		addDoc,
		setDoc,
		deleteDoc,
		where,
		query,
		orderBy,
		onSnapshot
	} from 'firebase/firestore';

	import { toasts, ToastContainer, FlatToast, BootstrapToast }  from "svelte-toasts";

	let categories = $state([]);
	let recipes = $state([]);
	let editId = $state([]);
	let selRecipe;
	let loading = $state(true);
	let error = $state(null);
	let data = $state([]);
	let message = '';

	let name = $state('');
	let category = $state('');
	let book = $state('');
	let desc = $state('');
	let feeds = $state('');
	let rating = $state('');


	const showToast = () => {
		console.log("toasts")
    const toast = toasts.add({
      title: 'Updated',
      
      duration:3000, // 0 or negative to avoid auto-remove
      placement: 'top-left',
      type: 'success',
      theme: 'light',
    
      type: 'success',
      
      onClick: () => {},
      onRemove: () => {},
      // component: BootstrapToast, // allows to override toast component/template per toast
    });

     toast.remove()

  };

	// get recipe categories and uom options from firebase

	const saved = localStorage.getItem('editId');

	editId = saved;

	onMount(() => {
		const fetchData = async () => {
			try {
				loading = true;

				const [recCatsSnapshot] = await Promise.all([getDocs(collection(db, 'categories'))]);
				const [recRecipesSnapshot] = await Promise.all([getDocs(collection(db, 'meals'))]);

				categories = recCatsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));

				recipes = recRecipesSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));
			} catch (err) {
				error = err.message;
				//console.error('Error fetching data:', err);
			} finally {
				loading = false;
			}

			//console.log('cats', categories);
			//console.log('recipes', recipes);
			//console.log('editId', editId);

			const findRecipe = JSON.parse(editId);

			let filteredData = recipes.filter((item) => item.id === findRecipe);
			let data = $state(filteredData[0]['details']);
			console.log('data', data);

			name = data.name || '';
			desc = data.desc || '';
			book = data.book || '';
			category = data.category || '';
			feeds = data.feeds || 0;
			rating = data.rating || 0;

			//console.log('name', name);
			localStorage.setItem('details', JSON.stringify({ name }));
		};

		fetchData();
	});

	onDestroy(() => {
		//console.log('on destroy');
	});

	async function handleSubmit(e) {
		e.preventDefault();
		console.log('Form submitted:', { name, desc, book, category, feeds, rating });
		
		const docRef = doc(db, 'meals', JSON.parse(editId));
		await updateDoc(docRef,
			{
				details: {
					name: name,
					desc: desc,
					book: book,
					category: category,
					feeds: feeds,
					rating: rating
				}
			},
			{ merge: true }
		
		);
		showToast();

		// update firebase
	}

	
</script>


<div class="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-2xl font-bold text-gray-800">Recipe Description</h1>

	<form onsubmit={handleSubmit} class="space-y-4">
		<div>
			<input
				id="name"
				type="text"
				bind:value={name}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Enter recipe name"
			/>
		</div>

		<div>
			<textarea
				id="desc"
				bind:value={desc}
				rows="4"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Add short description"
			></textarea>
		</div>

		<div>
			<input
				id="book"
				type="tel"
				bind:value={book}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Enter your book number"
			/>
		</div>

		<div>
			<select
				id="category"
				bind:value={category}
				class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				aria-label="Category"
				placeholder="Recipe Category"
			>
				<option value="">Select Category</option>
				{#each categories as cat}
					<option value={cat.catname}>{cat.catname}</option>
				{/each}
			</select>
		</div>

		<div>
			<input
				id="feeds"
				type="number"
				bind:value={feeds}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="feeds (number)"
			/>
		</div>

		<div>
			<label for="rating" class="mb-1 block text-sm font-medium text-gray-700">
				Rating: {rating}/10
			</label>
			<div class="flex items-center space-x-3">
				<span class="text-sm text-gray-500">1</span>
				<input
					id="rating"
					type="range"
					min="1"
					max="10"
					bind:value={rating}
					class="slider h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
				/>
				<span class="text-sm text-gray-500">10</span>
			</div>
			<div class="mt-1 text-center">
				<span class="inline-block rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
					{rating}
				</span>
			</div>
			<div>
				<button
					type="submit"
					class="col-start-1 row-start-1 mt-2 w-full rounded-md bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Add ingredient"
				>
					Update
				</button>
			</div>
		</div>
	</form>
	<ToastContainer placement="bottom-right" let:data={data}>
    <FlatToast {data} /> 
  </ToastContainer> 
</div>

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #2563eb;
		cursor: pointer;
		border: 2px solid #ffffff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.slider::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #2563eb;
		cursor: pointer;
		border: 2px solid #ffffff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.slider::-webkit-slider-track {
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%);
	}

	.slider::-moz-range-track {
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%);
	}
</style>
