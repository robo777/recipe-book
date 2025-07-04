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

	import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
	import { onMount } from 'svelte';
	const storage = getStorage();

	let tempImages = $state([]);
	let draggedStep = $state(null);
	let dragOverIndex = $state(null);
	let images = $state([]);
	tempImages = [];

	// Local component state using $state
	let state = $state({
		files: [],
		uploading: false,
		uploadedImages: [], // array of { name, url }
		error: ''
	});

	//async function update(){
	// onMount(async () => {
	// 	images = [];
		

	// 	console.log('ON MOUNT');

	// 	const [imagesSnapshot] = await Promise.all([getDocs(collection(db, 'images'))]);

	// 	tempImages = imagesSnapshot.docs.map((doc) => ({
	// 		id: doc.id,
	// 		...doc.data()
	// 	}));

	// 	for (let i = 0; i < tempImages.length; i++) {
	// 		images.push({
	// 			// uploadedAt:timeStamp,
	// 			order: tempImages[i]['order'],
	// 			url: tempImages[i]['url'],
	// 			path: tempImages[i]['path']
	// 		});
	// 	}

		
	// 	//console.log('images before sort', images);
	// 	// sort images array by order
	// 	images.sort(function (a, b) {
	// 		return a.order - b.order;
	// 	});

	// 	//console.log('images after sort', images);

	// 	localStorage.setItem('images', JSON.stringify(images));
	// });

	function waitForImageLoad(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = resolve;
			img.onerror = reject;
			img.src = src;
	})}	

	async function handleUpload() {
		state.error = '';
		state.uploadedImages = [];

		const validFiles = Array.from(state.files).filter((file) => file.type === 'image/jpeg');

		if (!validFiles.length) {
			state.error = 'Please select at least one valid JPG image.';
			return;
		}

		state.uploading = true;

		try {
			for (const file of validFiles) {
				const filePath = `images/${Date.now()}-${file.name}`;
				const timeStamp = new Date();
				const storageRef = ref(storage, filePath);
				await uploadBytes(storageRef, file);
				const downloadURL = await getDownloadURL(storageRef);

				await waitForImageLoad(downloadURL);

				await addDoc(collection(db, 'images'), {
					order: 0,
					name: file.name,
					path: filePath,
					url: downloadURL,
					uploadedAt: new Date()
				});
				let cntr = 0;
				images.push({
					order: 0,
					url: downloadURL,
					path: filePath
				});

				// set order of images in temp file

				console.log('uploaded Images', images);

				localStorage.setItem('images', JSON.stringify(images));
			}
		} catch (err) {
			state.error = 'Upload failed: ' + err.message;
		} finally {
			state.uploading = false;
		}
	}

	async function updateImageOrder() {
		// current index
		const imageOrder = JSON.parse(localStorage.getItem('images'));
		//console.log('image order', imageOrder[0]['order']);

		// delete images collection
		const collRef = collection(db, 'images');
		const BATCH_SIZE = 400; // Firestore batch limit is 500

		try {
			// Loop to handle collections potentially larger than the batch size
			while (true) {
				const q = query(collRef, limit(BATCH_SIZE));
				const snapshot = await getDocs(q);

				if (snapshot.empty) {
					console.log('No more documents found in the collection.');
					break; // Exit loop if no docs left
				}

				const batch = writeBatch(db);
				snapshot.forEach((doc) => {
					batch.delete(doc.ref);
				});

				await batch.commit();
			} // End while loop
		} catch (err) {
			console.error(`Error deleting documents from ${'images'}:`, err);
		} finally {
			//isLoading = false;
		}
		// reload sorted images

		for (let i = 0; i < imageOrder.length; i++) {
			await addDoc(collection(db, 'images'), {
				order: imageOrder[i]['order'],
				url: imageOrder[i]['url'],
				path: imageOrder[i]['path']
			});
		}

		const imagesRef = collection(db, 'images');
		const snapshot = await getDocs(imagesRef);
		const batch = writeBatch(db);
		let counter = 0;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let draggedIndex = $state(null);
	let draggedOverIndex = $state(null);

	function handleDragStart(event, index) {
		draggedIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/html', event.target);
	}

	function handleDragOver(event, index) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		draggedOverIndex = index;
	}

	function handleDragLeave() {
		draggedOverIndex = null;
	}

	function handleDrop(event, dropIndex) {
		event.preventDefault();

		if (draggedIndex !== null && draggedIndex !== dropIndex) {
			const draggedItem = images[draggedIndex];
			const newImages = [...images];

			// Remove dragged item
			newImages.splice(draggedIndex, 1);

			// Insert at new position
			const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
			newImages.splice(insertIndex, 0, draggedItem);

			images = newImages;

			for (let i = 0; i < images.length; i++) {
				images[i].order = i;
			}
			localStorage.setItem('images', JSON.stringify(images));
			console.log('after drag', images);
			// update order in db !!
			updateImageOrder();
			//updateImageOrder();
		}

		draggedIndex = null;
		draggedOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		draggedOverIndex = null;
	}

	function moveUp(index) {
		if (index > 0) {
			const newImages = [...images];
			[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
			images = newImages;
		}
	}

	function moveDown(index) {
		if (index < images.length - 1) {
			const newImages = [...images];
			[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
			images = newImages;
		}
	}

	async function deleteImage2(index, order) {
		const newImages = [...images];
		newImages.splice(index, 1);
		images = newImages;
		

		// console.log('index deleted', images.length);

		// // remove from temp db
		// const q = query(collection(db, 'images'), where('order', '==', order));
		// const querySnapshot = await getDocs(q);

		// const deletePromises = [];
		// querySnapshot.forEach((document) => {
		// 	deletePromises.push(deleteDoc(doc(db, 'images', document.id)));
		// });

		// await Promise.all(deletePromises);
	}
</script>

<div
	class="mx-auto mt-10 max-w-2xl rounded-xl border bg-white p-6 shadow"
	role="form"
	aria-label="Multiple image upload form"
>
	<h1 class="mb-4 text-2xl font-bold">Upload JPG Images</h1>

	<input
		type="file"
		accept=".jpg, .jpeg"
		multiple
		aria-label="Choose JPG files"
		onchange={(e) => (state.files = e.target.files)}
		class="mb-4 block w-full rounded border border-gray-300 px-3 py-2"
	/>

	<button
		onclick={handleUpload}
		class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		aria-busy={state.uploading}
		disabled={state.uploading}
	>
		{state.uploading ? 'Uploading...' : 'Upload All'}
	</button>

	{#if state.error}
		<div class="mt-4 text-red-600" role="alert">{state.error}</div>
	{/if}
</div>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800">Reorderable Image Gallery</h1>

	<div
		class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
		role="list"
		aria-label="Reorderable image gallery"
	>
		{#each images as image, index (image.url)}
			<div
				class="group relative overflow-hidden rounded-lg border-2 bg-white shadow-md transition-all duration-200 {draggedIndex ===
				index
					? 'scale-95 opacity-50'
					: ''} {draggedOverIndex === index ? 'border-blue-400 shadow-lg' : 'border-gray-200'}"
				draggable="true"
				ondragstart={(e) => handleDragStart(e, index)}
				ondragover={(e) => handleDragOver(e, index)}
				ondragleave={handleDragLeave}
				ondrop={(e) => handleDrop(e, index)}
				ondragend={handleDragEnd}
				role="listitem"
				aria-label="Image {index + 1} of {images.length}: {image.alt}"
			>
				<img src={image.url} alt={image.alt} class="h-40 w-full object-cover" loading="lazy" />

				<div class="p-3">
					<div class="flex gap-2">
						<button
							onclick={() => deleteImage2(index, image.order)}
							class="rounded bg-red-500 px-3 py-1 text-xs text-white transition-colors hover:bg-red-600"
							aria-label="Delete {image.alt} "
						>
							🗑️ {index} - {image.order}
						</button>
					</div>
				</div>

				<div class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
					<div class="bg-opacity-50 rounded bg-black px-2 py-1 text-xs text-white">
						Drag to reorder
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-8 rounded-lg bg-gray-100 p-4">
		<h2 class="mb-2 text-lg font-semibold">Instructions:</h2>
		<ul class="space-y-1 text-sm text-gray-700">
			<li>• Drag and drop images to reorder them, the top left image will be the main</li>
		</ul>
	</div>
</div>
