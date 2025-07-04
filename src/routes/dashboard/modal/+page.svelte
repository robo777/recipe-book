<!-- DeleteModal.svelte -->
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
        import { browser } from '$app/environment';

    let delId = $state('');

onMount(() => {
		if (browser) {
			const savedId = localStorage.getItem('delId');
      
			if (savedId) {    
			
       delId = JSON.parse(savedId)
     
			}
			
		}
		
	});


  let {  title = "Confirm Delete", message = "Are you sure you want to delete this item? This action cannot be undone." } = $props();
import { goto } from '$app/navigation';
  

  


async function handleDelete() {
		console.log('Item to delete', delId);
		await deleteDoc(doc(db, 'meals', delId));

		
		
 goto('/dashboard/recipes');

	

  
	}

	function handleCancel() {
		console.log('Delete cancelled');
     goto('/dashboard/recipes');
	}

</script>


  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-red bg-opacity-600 flex items-center justify-center z-50"
    
  >
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <!-- Header -->
      <div class="flex items-center mb-4">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="text-center">
        <h3 id="modal-title" class="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          {message}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onclick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onclick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>