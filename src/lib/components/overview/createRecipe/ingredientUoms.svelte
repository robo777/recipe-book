<script>

  import { db } from '$lib/client/firebase';
	import { collection, doc, addDoc,setDoc,deleteDoc, where, query, orderBy, onSnapshot } from 'firebase/firestore';

  let items = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
  let uoms = $state([]);

  
  

  const ingredDataRef = collection(db, 'uoms');

  // Function to fetch data from Firestore
  $effect(() => {
		
		console.log('Setting up Firestore listener...');
		isLoading = true;
		error = null;

		

		// onSnapshot returns the unsubscribe function
		const unsubscribe = onSnapshot(
			ingredDataRef,
			(querySnapshot) => {
				const updatedItems = [];
				//workArray = [];
				querySnapshot.forEach((doc) => {
					updatedItems.push({ id: doc.id, ...doc.data() });
				});

				// Find latest device readings for today *****************************
			 uoms = updatedItems;
					
				

				console.log("uoms",updatedItems)

			
				isLoading = false; // Data loaded (or updated)
			},
			(err) => {
				console.error('Error listening to collection:', err);
				error = err.message || 'Firestore listener error';
				isLoading = false;
			}
		);

		// Return the cleanup function from the effect
		// Svelte will run this when the component unmounts
		return () => {
			console.log('Cleaning up Firestore listener...');

			unsubscribe();
		};
	});


 
  
  let searchTerm = $state('');
  let newUom = $state({ uomname: '' });
  let editingId = $state(null);
  let editForm = $state({ uomname: '' });
  
  let nextId = $state(4);
  
   const filtereduoms = $derived(
    uoms.filter(uom => 
      uom.uomname.toLowerCase().includes(searchTerm.toLowerCase()) 
      
    )
  );
  
  async function addIngredient(e) {
    e.preventDefault();
    if (newUom.uomname.trim() ) {
      

      console.log("add clicked")

       const docRef = await addDoc(collection(db, 'uoms'), {
        uomname: newUom.uomname,
        
      });
     
    }
  }
  
  async function deleteIngredient(id) {
     const docRef = doc(db, 'uoms', id);
     await deleteDoc(docRef);
  }
  
  function startEdit(uom) {
    editingId = uom.id;
    editForm.uomname = uom.uomname;
    

    console.log("start id", editingId)
    console.log("editForm", editForm)
  }
  
  async function saveEdit() {
    if (editForm.uomname.trim()  ) {
      //const index = ingredients.findIndex(ing => ing.id === editingId);
      console.log("index", editingId)
      
      const docRef = doc(db, 'uoms', editingId);

     await setDoc(docRef,{
        uomname: editForm.uomname,
        
      }, { merge: true });
      
      cancelEdit();
    }
  }



  
  function cancelEdit() {
    editingId = null;
    editForm.uomname = '';
    
  }
</script>

<div class="max-w-4xl mx-auto p-6 bg-white">
  <h1 class="text-3xl font-bold text-gray-800 mb-8">Recipe uom Manager</h1>
  
  <!-- Add New Ingredient Form -->
  <div class="bg-gray-50 p-6 rounded-lg mb-8">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">Add New uom</h2>
    <form onsubmit={addIngredient} class="p-1">
      <div>
      <input
        type="text"
        bind:value={newUom.uomname}
        placeholder="uom name"
        class="col-start-1 row-start-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Ingredient name"
      />
      </div>
      
      
      
      <div>
      <button
        type="submit"
        class="col-start-1 row-start-1 w-full mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
      placeholder="Search uoms..."
      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Search ingredients"
    />
  </div>
  
  <!-- uoms List -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-100 px-6 py-3 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700">
       uoms ({filtereduoms.length})
      </h2>
    </div>
    
    {#if filtereduoms.length === 0}
      <div class="px-6 py-8 text-center text-gray-500">
        {searchTerm ? 'No uoms found matching your search.' : 'No uoms added yet.'}
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each filtereduoms as uom (uom.id)}
          <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            {#if editingId === uom.id}
              <!-- Edit Form -->
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <input
                  type="text"
                  bind:value={editForm.uomname}
                  class="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Edit ingredient name"
                />
                
                <div class="flex gap-2 col-span-full sm:col-span-1">
                  <button
                    onclick={saveEdit}
                    class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Save changes"
                  >
                    Save
                  </button>
                  <button
                    onclick={cancelEdit}
                    class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            {:else}
              <!-- Display Mode -->
              <div class="flex-1">
                <div class="font-medium text-gray-900">{uom.uomname}</div>
                
              </div>
              <div class="flex gap-2">
                <button
                  onclick={() => startEdit(uom)}
                  class="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  aria-label="Edit {uom}"
                >
                  Edit
                </button>
                <button
                  onclick={() => deleteIngredient(uom.id)}
                  class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Delete {uom.uomname}"
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