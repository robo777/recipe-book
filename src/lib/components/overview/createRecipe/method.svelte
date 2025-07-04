<!-- src/routes/+page.svelte -->
<script>
import { browser } from '$app/environment';
import { onMount } from 'svelte';


let methodSteps = $state([]);
let methods = [];

onMount(() => {
		if (browser) {
			const savedMethod = localStorage.getItem('method');
      
			if (savedMethod) {    
			//test = ({id:12,"ingredname":"poopoo"})
      methods = JSON.parse(savedMethod)
      methodSteps = methods;
      let xx = methodSteps
        console.log("method",xx);
			}
			
		}
		
	});



  // let methodSteps = $state([
  //   { id: 1, text: 'Preheat oven to 180°C (350°F) and grease a baking dish with butter.' },
  //   { id: 2, text: 'In a large bowl, whisk together flour, baking powder, and salt.' },
  //   { id: 3, text: 'In another bowl, cream butter and sugar until light and fluffy.' },
  //   { id: 4, text: 'Add eggs one at a time, beating well after each addition.' },
  //   { id: 5, text: 'Gradually mix in the dry ingredients, alternating with milk.' }
  // ]);

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
      id: Math.max(...methodSteps.map(s => s.id), 0) + 1,
      text: formData.text.trim()
    };
    
    methodSteps = [...methodSteps, newStep];
    console.log("methodSteps", methodSteps)
    logRecipeToConsole()
    resetForm();
  }

  function editStep(step) {
    formData.text = step.text;
    editingId = step.id;
    showForm = true;
  }

  function updateStep() {
    if (!formData.text.trim()) return;
    
    const index = methodSteps.findIndex(s => s.id === editingId);
    if (index !== -1) {
      methodSteps[index] = {
        ...methodSteps[index],
        text: formData.text.trim()
      };
    }
    logRecipeToConsole()
    resetForm();
  }

  function deleteStep(id) {
    if (confirm('Are you sure you want to delete this step?')) {
      methodSteps = methodSteps.filter(s => s.id !== id);
    }
    logRecipeToConsole()
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
    logRecipeToConsole()
  }

  function moveStepUp(index) {
    if (index === 0) return;
    const newSteps = [...methodSteps];
    [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    methodSteps = newSteps;
    logRecipeToConsole()
  }

  function moveStepDown(index) {
    if (index === methodSteps.length - 1) return;
    const newSteps = [...methodSteps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    methodSteps = newSteps;
    logRecipeToConsole()
  }


 // log and save to web storage
  function logRecipeToConsole() {
    //console.log("index",methodSteps.findIndex())


    const methodOutput = {
     
      tasks: methodSteps.map((item, index) => ({
        id: item.id,
        text: item.text,
        order:index
        
        
       
      })),
      
    };
    localStorage.setItem('method', JSON.stringify(methodOutput.tasks));
    console.log("Method JSON Output:", JSON.stringify(methodOutput, null, 2));
  }
</script>

<svelte:head>
  <title>Recipe Method Manager</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="mb-8" role="banner">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Recipe Method Manager</h1>
      <p class="text-gray-600">Create and organize your recipe steps with drag & drop</p>
    </div>

    <!-- Controls -->
    <div class="mb-6 flex justify-between items-center" role="toolbar" aria-label="Page controls">
      <div class="text-sm text-gray-600" role="status" aria-live="polite">
        {methodSteps.length} step{methodSteps.length === 1 ? '' : 's'} • Drag to reorder
      </div>
      
      <button
        onclick={() => { showForm = true;  }}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        aria-expanded={showForm}
        aria-controls="step-form"
        aria-label={showForm ? 'Cancel adding step' : 'Add new recipe step'}
      >
        {showForm ? 'Cancel' : 'Add Step'}
      </button>

      
    </div>

    <!-- Add/Edit Form -->
    {#if showForm}
      <div id="step-form" class="bg-white rounded-lg shadow-md p-6 mb-6" role="form" aria-labelledby="form-heading">
        <h2 id="form-heading" class="text-xl font-semibold mb-4">
          {editingId ? 'Edit Step' : 'Add New Step'}
        </h2>
        
        <form onsubmit={handleSubmit}>
          <div class="mb-4">
            <label for="stepText" class="block text-sm font-medium text-gray-700 mb-2">
              Step Description *
            </label>
            <textarea
              id="stepText"
              bind:value={formData.text}
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Describe what to do in this step..."
              aria-describedby="stepText-help"
            ></textarea>
            <div id="stepText-help" class="sr-only">Enter a detailed description of what to do in this recipe step</div>
          </div>

          <div class="flex gap-3" role="group" aria-label="Form actions">
            <button
              type="submit"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              aria-describedby="submit-help"
            >
              {editingId ? 'Update' : 'Add'} Step
            </button>
            <div id="submit-help" class="sr-only">{editingId ? 'Update the existing step' : 'Add the new step to the recipe'}</div>
            <button
              type="button"
              onclick={resetForm}
              class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
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
        <div class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500" role="status">
          No method steps yet. Add your first step to get started!
        </div>
      {:else}
        {#each methodSteps as step, index (step.id)}
          <div
            class="bg-white rounded-lg shadow-md transition-all duration-200 {dragOverIndex === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''}"
            role="listitem"
            draggable="true"
            aria-label="Step {index + 1}: {step.text.slice(0, 50)}{step.text.length > 50 ? '...' : ''}"
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
                  <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                <!-- Step Content -->
                <div class="flex-1 min-w-0" role="region" aria-labelledby="step-{step.id}-number">
                  <p class="text-gray-900 leading-relaxed" id="step-{step.id}-text">{step.text}</p>
                </div>

                <!-- Actions -->
                <div class="flex-shrink-0 flex items-center gap-2" role="toolbar" aria-label="Step actions">
                  <!-- Drag Handle -->
                  <button 
                    class="cursor-move text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent" 
                    aria-label="Drag to reorder step"
                    title="Drag to reorder"
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, step, index)}
                    ondragend={handleDragEnd}
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>

                  <!-- Move Up/Down Buttons -->
                  <div class="flex flex-col gap-1" role="group" aria-label="Reorder controls">
                    <button
                      onclick={() => moveStepUp(index)}
                      disabled={index === 0}
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move step up"
                      title="Move step up"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    <button
                      onclick={() => moveStepDown(index)}
                      disabled={index === methodSteps.length - 1}
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move step down"
                      title="Move step down"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </div>

                  <!-- Edit/Delete Actions -->
                  <div class="flex gap-2 ml-2" role="group" aria-label="Edit and delete controls">
                    <button
                      onclick={() => editStep(step)}
                      class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                      aria-label="Edit step {index + 1}"
                    >
                      Edit
                    </button>
                    <button
                      onclick={() => deleteStep(step.id)}
                      class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
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
    </div>

    <!-- Instructions -->
    {#if methodSteps.length > 0}
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="font-medium text-blue-900 mb-1">How to reorder steps:</h3>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Drag and drop any step to reorder</li>
              <li>• Use the up/down arrow buttons for precise movement</li>
              <li>• Step numbers update automatically</li>
            </ul>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>