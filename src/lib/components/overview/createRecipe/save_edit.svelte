<script>
	import { db } from '$lib/client/firebase';
	import {
		collection,
		doc,
		addDoc,
		getDocs,
		setDoc,
		deleteDoc,
		where,
		query,
		orderBy,
		onSnapshot,
		limit,
		writeBatch
	} from 'firebase/firestore';

	const recipeDataRef = collection(db, 'meals');
	let isLoading = $state(true);
	let error = $state(null);
	let dataMissing = $state('');
	let errorLog = $state([]);
	let errorCheck = $state(0);
	let imagePack = $state([])

	//console.log("index",methodSteps.findIndex())

	const method = JSON.parse(localStorage.getItem('method'));
	const details = JSON.parse(localStorage.getItem('desc'));
	const ingredients = JSON.parse(localStorage.getItem('recipe'));
	const images = JSON.parse(localStorage.getItem('images'));

	console.log('details ', details);
	console.log('method', method);
	console.log('images', images);
	console.log('ingredients', ingredients);

	async function deleteTempImages() {
		const notesRef = collection(db, 'notes');
		const q = query(notesRef, limit(3));
		const snapshot = await getDocs(q);

		const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, 'notes', d.id)));
		await Promise.all(deletes);

		return { success: true };
	}

	//Check for missing data

	function checkData() {
		errorLog = [];
		errorCheck = 0;

		console.log('details ', details);
		console.log('method', method);
		console.log('images', images);
		console.log('ingredients', ingredients);

		if (details == null || details.length === 0) {
			console.log('no details');
			errorLog.push('details are missing');
			errorCheck = 1;
		} else {
			console.log('details is here');
		}

		if (images == null || images.length === 0) {
			console.log('no images');
			errorLog.push('images are missing');
			errorCheck = 1;
		} else {
			console.log('images is here');
		}

		if (method == null || method.length === 0) {
			console.log('no methods');
			errorLog.push('methods are missing');
			errorCheck = 1;
		} else {
			console.log('method is here');
		}

		if (ingredients == null || ingredients.length === 0) {
			console.log('no ingredients');
			errorLog.push('ingredients are missing');
			errorCheck = 1;
		} else {
			console.log('ingredients is here');
		}

		console.log('error log', errorLog);
		console.log('error check', errorCheck);

		getWebData();
	}

	

	async function getWebData() {
		// add recipe to firestore

		let imagePack = [];

		for (let i = 0; i < images.length; i++) {
			imagePack.push({
				order: 0,
				url: images[i]['url'],
				path: images[i]['path']
			});
	
			
		}
		console.log('Images', imagePack);

		if (errorCheck === 0) {
			const docRef = await addDoc(collection(db, 'meals'), {
				method: method,
				details: details,
				ingredients: ingredients,
				images: imagePack
			});
		}
			// delete web storage
			// localStorage.removeItem('desc');
			// localStorage.removeItem('method');
			// localStorage.removeItem('recipe');
			// localStorage.removeItem('images');

			
		//}
	}

	
</script>

<button
	onclick={checkData}
	class="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-orange-700"
>
	Save Recipe
</button>



{#each errorLog as e}
	<div class="text-red-600">
		<p class="mt-1 text-sm break-words">{e}</p>
	</div>
{/each}
