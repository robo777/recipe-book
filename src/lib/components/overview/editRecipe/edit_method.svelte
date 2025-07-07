<!-- src/routes/+page.svelte -->
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
	import { toasts, ToastContainer, FlatToast, BootstrapToast } from 'svelte-toasts';

	let methodSteps = $state([]);
	let methods = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let editId = $state('');
	const saved = localStorage.getItem('editId');

	editId = saved;

	const showToast = () => {
		const toast = toasts.add({
			title: 'Updated',

			duration: 3000, // 0 or negative to avoid auto-remove
			placement: 'bottom-left',
			type: 'success',
			theme: 'light',

			type: 'success',

			onClick: () => {},
			onRemove: () => {}
			// component: BootstrapToast, // allows to override toast component/template per toast
		});

		 toast.remove()
	};

	onMount(() => {
		const fetchData = async () => {
			try {
				loading = true;

				const [methodSnapshot] = await Promise.all([getDocs(collection(db, 'meals'))]);

				methods = methodSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));
			} catch (err) {
				error = err.message;
				//console.error('Error fetching data:', err);
			} finally {
				loading = false;
			}

			//console.log('methods',methods );
			//console.log('recipes', recipes);
			//console.log('editId', editId);

			const findRecipe = JSON.parse(editId);

			let filteredData = methods.filter((item) => item.id === findRecipe);
			let data = $state(filteredData[0]['method']);
			console.log('data', data);

			for (let i = 0; i < data.length; i++) {
				methodSteps.push({
					id: data[i]['id'],
					text: data[i]['text']
				});
			}
		};
		console.log('METHOD STEPS', methodSteps);
		fetchData();
	});

	let showForm = $state(false);
	let editingId = $state(null);
	let draggedStep = $state(null);
	let dragOverIndex = $state(null);

	let formData = $state({
		text: ''
	});

	function resetForm() {
		formData.text = '';
		showForm = false;
		editingId = null;
	}

	function addStep() {
		if (!formData.text.trim()) return;

		const newStep = {
			id: Math.max(...methodSteps.map((s) => s.id), 0) + 1,
			text: formData.text.trim()
		};

		methodSteps = [...methodSteps, newStep];
		console.log('methodSteps', methodSteps);
		logRecipeToConsole();
		resetForm();
	}

	function editStep(step) {
		formData.text = step.text;
		editingId = step.id;
		showForm = true;
	}

	function updateStep() {
		if (!formData.text.trim()) return;

		const index = methodSteps.findIndex((s) => s.id === editingId);
		if (index !== -1) {
			methodSteps[index] = {
				...methodSteps[index],
				text: formData.text.trim()
			};
		}
		logRecipeToConsole();
		resetForm();
	}

	function deleteStep(id) {
		if (confirm('Are you sure you want to delete this step?')) {
			methodSteps = methodSteps.filter((s) => s.id !== id);
		}
		logRecipeToConsole();
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (editingId) {
			updateStep();
		} else {
			addStep();
		}
	}

	// Drag and Drop Functions
	function handleDragStart(e, step, index) {
		draggedStep = { step, index };
		e.dataTransfer.effectAllowed = 'move';
		e.target.style.opacity = '0.5';
	}

	function handleDragEnd(e) {
		e.target.style.opacity = '1';
		draggedStep = null;
		dragOverIndex = null;
	}

	function handleDragOver(e, index) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(e, dropIndex) {
		e.preventDefault();

		if (!draggedStep || draggedStep.index === dropIndex) {
			dragOverIndex = null;
			return;
		}

		const newSteps = [...methodSteps];
		const draggedItem = newSteps[draggedStep.index];

		// Remove the dragged item
		newSteps.splice(draggedStep.index, 1);

		// Insert at new position
		newSteps.splice(dropIndex, 0, draggedItem);

		methodSteps = newSteps;
		dragOverIndex = null;
		logRecipeToConsole();
	}

	function moveStepUp(index) {
		if (index === 0) return;
		const newSteps = [...methodSteps];
		[newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
		methodSteps = newSteps;
		logRecipeToConsole();
	}

	function moveStepDown(index) {
		if (index === methodSteps.length - 1) return;
		const newSteps = [...methodSteps];
		[newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
		methodSteps = newSteps;
		logRecipeToConsole();
	}

	// log and save to web storage
	function logRecipeToConsole() {
		//console.log("index",methodSteps.findIndex())

		const methodOutput = {
			tasks: methodSteps.map((item, index) => ({
				id: item.id,
				text: item.text,
				order: index
			}))
		};
		localStorage.setItem('method', JSON.stringify(methodOutput.tasks));
		console.log('Method JSON Output:', JSON.stringify(methodOutput, null, 2));
	}

	async function updateMethod() {
		const docRef = doc(db, 'meals', JSON.parse(editId));

		await updateDoc(
			docRef,
			{
				method: methodSteps
			},

			{ merge: true }
		);

		showToast();
	}
</script>


<svelte:head>
	<title>Recipe Method Manager</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4">
		<!-- Header -->
		<div class="mb-8" role="banner">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Recipe Method Manager</h1>
			<p class="text-gray-600">Create and organize your recipe steps with drag & drop</p>
		</div>

		<!-- Controls -->
		<div class="mb-6 flex items-center justify-between" role="toolbar" aria-label="Page controls">
			<div class="text-sm text-gray-600" role="status" aria-live="polite">
				{methodSteps.length} step{methodSteps.length === 1 ? '' : 's'} • Drag to reorder
			</div>

			<button
				onclick={() => {
					showForm = true;
				}}
				class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
				aria-expanded={showForm}
				aria-controls="step-form"
				aria-label={showForm ? 'Cancel adding step' : 'Add new recipe step'}
			>
				{showForm ? 'Cancel' : 'Add Step'}
			</button>
		</div>

		<!-- Add/Edit Form -->
		{#if showForm}
			<div
				id="step-form"
				class="mb-6 rounded-lg bg-white p-6 shadow-md"
				role="form"
				aria-labelledby="form-heading"
			>
				<h2 id="form-heading" class="mb-4 text-xl font-semibold">
					{editingId ? 'Edit Step' : 'Add New Step'}
				</h2>

				<form onsubmit={handleSubmit}>
					<div class="mb-4">
						<label for="stepText" class="mb-2 block text-sm font-medium text-gray-700">
							Step Description *
						</label>
						<textarea
							id="stepText"
							bind:value={formData.text}
							required
							rows="3"
							class="resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							placeholder="Describe what to do in this step..."
							aria-describedby="stepText-help"
						></textarea>
						<div id="stepText-help" class="sr-only">
							Enter a detailed description of what to do in this recipe step
						</div>
					</div>

					<div class="flex gap-3" role="group" aria-label="Form actions">
						<button
							type="submit"
							class="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700"
							aria-describedby="submit-help"
						>
							{editingId ? 'Update' : 'Add'} Step
						</button>
						<div id="submit-help" class="sr-only">
							{editingId ? 'Update the existing step' : 'Add the new step to the recipe'}
						</div>
						<button
							type="button"
							onclick={resetForm}
							class="rounded-md bg-gray-600 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700"
							aria-label="Cancel and close form"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Method Steps -->
		<div class="space-y-4" role="list" aria-label="Recipe method steps">
			{#if methodSteps.length === 0}
				<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md" role="status">
					No method steps yet. Add your first step to get started!
				</div>
			{:else}
				{#each methodSteps as step, index (step.id)}
					<div
						class="rounded-lg bg-white shadow-md transition-all duration-200 {dragOverIndex ===
						index
							? 'bg-blue-50 ring-2 ring-blue-500'
							: ''}"
						role="listitem"
						draggable="true"
						aria-label="Step {index + 1}: {step.text.slice(0, 50)}{step.text.length > 50
							? '...'
							: ''}"
						ondragstart={(e) => handleDragStart(e, step, index)}
						ondragend={handleDragEnd}
						ondragover={(e) => handleDragOver(e, index)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, index)}
					>
						<div class="p-6">
							<div class="flex items-start gap-4">
								<!-- Step Number -->
								<div class="flex-shrink-0" role="img" aria-label="Step number {index + 1}">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
									>
										{index + 1}
									</div>
								</div>

								<!-- Step Content -->
								<div class="min-w-0 flex-1" role="region" aria-labelledby="step-{step.id}-number">
									<p class="leading-relaxed text-gray-900" id="step-{step.id}-text">{step.text}</p>
								</div>

								<!-- Actions -->
								<div
									class="flex flex-shrink-0 items-center gap-2"
									role="toolbar"
									aria-label="Step actions"
								>
									<!-- Drag Handle -->
									<button
										class="cursor-move border-none bg-transparent p-1 text-gray-400 hover:text-gray-600"
										aria-label="Drag to reorder step"
										title="Drag to reorder"
										draggable="true"
										ondragstart={(e) => handleDragStart(e, step, index)}
										ondragend={handleDragEnd}
									>
										<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
											<path
												d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
											></path>
										</svg>
									</button>

									<!-- Move Up/Down Buttons -->
									<div class="flex flex-col gap-1" role="group" aria-label="Reorder controls">
										<button
											onclick={() => moveStepUp(index)}
											disabled={index === 0}
											class="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
											aria-label="Move step up"
											title="Move step up"
										>
											<svg
												class="h-4 w-4"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fill-rule="evenodd"
													d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
													clip-rule="evenodd"
												></path>
											</svg>
										</button>
										<button
											onclick={() => moveStepDown(index)}
											disabled={index === methodSteps.length - 1}
											class="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
											aria-label="Move step down"
											title="Move step down"
										>
											<svg
												class="h-4 w-4"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fill-rule="evenodd"
													d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
													clip-rule="evenodd"
												></path>
											</svg>
										</button>
									</div>

									<!-- Edit/Delete Actions -->
									<div class="ml-2 flex gap-2" role="group" aria-label="Edit and delete controls">
										<button
											onclick={() => editStep(step)}
											class="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
											aria-label="Edit step {index + 1}"
										>
											Edit
										</button>
										<button
											onclick={() => deleteStep(step.id)}
											class="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
											aria-label="Delete step {index + 1}"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
			 <ToastContainer placement="bottom-right" let:data>
				<FlatToast {data} /> 
				<!-- Provider template for your toasts -->
			 </ToastContainer> 
		</div>

		<!-- Instructions -->
		{#if methodSteps.length > 0}
			<div class="mt-8 rounded-lg p-4">
				<div>
					<button
						onclick={updateMethod}
						class="col-start-1 row-start-1 mt-2 w-full rounded-md bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						aria-label="Add ingredient"
					>
						Update
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
