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
	let okLog = $state([]);
	let errorCheck = $state(0);
	let imagePack = $state([])
	let images = $state([])
	let placeHolder = $state([{order: 0, url: 'https://firebasestorage.googleapis.com/v0/b/mealmanager-829bc.appspot.com/o/images%2F1751019117218-place-holder.jpg?alt=media&token=b7fc882a-cb23-4810-a46e-b034763bac9c', path: 'images/1751713738233-place-holder.jpg'}])
	//console.log("index",methodSteps.findIndex())

	const method = JSON.parse(localStorage.getItem('method'));
	const details = JSON.parse(localStorage.getItem('desc'));
	const ingredients = JSON.parse(localStorage.getItem('recipe'));
	 images = JSON.parse(localStorage.getItem('images'));
	

	//Check for missing data

	function checkData() {

		 if (images === null ){ images = [...placeHolder];};
			
		// 	order:placeHolder.order,
		// 	url:placeHolder.url,
		// 	path:placeHolder.path,

		// })
	
	//}

	console.log("images null", images)


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
			errorLog.push('images are missing, placeholder used');
			 
			errorCheck = 0;
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

		okLog.push('Recipe saved, go to "Recipes" to check');

		console.log("images length", images.length)

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
			localStorage.removeItem('desc');
			localStorage.removeItem('method');
			localStorage.removeItem('recipe');
			localStorage.removeItem('images');

			
		
	}

	
</script>

<button
	onclick={checkData}
	class="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-orange-700"
>
	Save Recipe
</button>



{#each errorLog as e}
	<div class="text-red-600 font-bold">
		<p class="mt-1 text-sm break-words">{e}</p>
	</div>
{/each}

{#each okLog as e}
	<div class="text-green-600 font-bold">
		<p class="mt-1 text-sm break-words">{e}</p>
	</div>
{/each}
