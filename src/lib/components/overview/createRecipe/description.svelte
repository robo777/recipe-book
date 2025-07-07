<!-- +page.svelte -->
<script>
	import { onMount } from 'svelte';
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

	
	
	
	let categories = $state([]);
	
	let loading = $state(true);
	let error = $state(null);

	$effect(() => {
		const fetchData = async () => {
			try {
				loading = true;

				const [recCatsSnapshot] = await Promise.all([getDocs(collection(db, 'categories'))]);

				categories = recCatsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));
			} catch (err) {
				error = err.message;
				console.error('Error fetching data:', err);
			} finally {
				loading = false;
			}

			
		};

		fetchData();
	});

	let formData = $state({
		name: '',
		desc: '',
		book: '',
		category: '',
		feeds:'',
		rating: 0,
		planned: false,
		
	});

	const STORAGE_KEY = 'desc';

	onMount(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				formData = { ...formData, ...parsed };
			} catch (e) {
				console.error('Failed to parse saved form data:', e);
			}
		}
	});

	function saveToStorage() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
	}

	function handleSubmit(e) {
		e.preventDefault();
		console.log('Form submitted:', formData);
		alert('Form saved! Check console for data.');
	}

	function clearForm() {
		formData = {
			name: '',
			desc: '',
			book: '',
			category: '',
			feeds:'',
			rating: 5
		};
		localStorage.removeItem(STORAGE_KEY);
	}

	// Auto-save on input changes
	$effect(() => {
		if (formData.name || formData.desc || formData.category ||formData.feeds || formData.rating !== 5) {
			saveToStorage();
		}
	});
</script>

<div class="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-2xl font-bold text-gray-800">Recipe Description</h1>

	<form onsubmit={handleSubmit} class="space-y-4">
		<div>
			<input
				id="name"
				type="text"
				bind:value={formData.name}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Enter recipe name"
			/>
		</div>

		<div>
			<textarea
				id="desc"
				bind:value={formData.desc}
				rows="4"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Add short description"
			></textarea>
		</div>

		<div>
			<input
				id="book"
				type="tel"
				bind:value={formData.book}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Enter your book number"
			/>
		</div>

		<div>
			

			<select
					id="category"
					bind:value={formData.category}
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
				bind:value={formData.feeds}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="feeds (number)"
			/>
		</div>

		<div>
			<label for="rating" class="mb-1 block text-sm font-medium text-gray-700">
				Rating: {formData.rating}/10
			</label>
			<div class="flex items-center space-x-3">
				<span class="text-sm text-gray-500">1</span>
				<input
					id="rating"
					type="range"
					min="1"
					max="10"
					bind:value={formData.rating}
					class="slider h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
				/>
				<span class="text-sm text-gray-500">10</span>
			</div>
			<div class="mt-1 text-center">
				<span class="inline-block rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
					{formData.rating}
				</span>
			</div>
		</div>

		
	</form>

	
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
