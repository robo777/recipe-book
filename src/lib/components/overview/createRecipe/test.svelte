
// src/routes/+page.svelte
<script>
  import { onMount } from 'svelte';
 import { db } from '$lib/client/firebase';
  import {  collection, getDocs } from 'firebase/firestore';
  import * as XLSX from 'xlsx';

  

  // Initialize Firebase
  //const app = initializeApp(firebaseConfig);
  //const db = getFirestore(app);

  // Runes state
  let collections = $state([]);
  let selectedCollection = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let data = $state([]);

  // Available collections - you can modify this list
  const availableCollections = [
    'categories',
    'ingred_cat',
    'ingredients',
    'meals',
    'uoms'
  ];

  onMount(() => {
    collections = availableCollections;
  });

  async function fetchCollectionData() {
    if (!selectedCollection) {
      error = 'Please select a collection';
      return;
    }

    isLoading = true;
    error = '';
    data = [];

    try {
      const querySnapshot = await getDocs(collection(db, selectedCollection));
      const fetchedData = [];

      querySnapshot.forEach((doc) => {
        fetchedData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      data = fetchedData;
      
      if (data.length === 0) {
        error = 'No data found in the selected collection';
      }
    } catch (err) {
      error = `Error fetching data: ${err.message}`;
      console.error('Error fetching collection:', err);
    } finally {
      isLoading = false;
    }
  }

  function downloadExcel() {
    if (data.length === 0) {
      error = 'No data to download';
      return;
    }

    try {
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedCollection);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${selectedCollection}_${timestamp}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      error = '';
    } catch (err) {
      error = `Error generating Excel file: ${err.message}`;
      console.error('Error creating Excel file:', err);
    }
  }

  function flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].join(', ');
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  function downloadFlattenedExcel() {
    if (data.length === 0) {
      error = 'No data to download';
      return;
    }

    try {
      // Flatten nested objects
      const flattenedData = data.map(item => flattenObject(item));
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedCollection);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${selectedCollection}_flattened_${timestamp}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      error = '';
    } catch (err) {
      error = `Error generating Excel file: ${err.message}`;
      console.error('Error creating Excel file:', err);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">
        Firestore to Excel Downloader
      </h1>
      
      <!-- Collection Selection -->
      <div class="mb-6">
        <label for="collection" class="block text-sm font-medium text-gray-700 mb-2">
          Select Collection
        </label>
        <select 
          id="collection"
          bind:value={selectedCollection}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a collection...</option>
          {#each collections as col}
            <option value={col}>{col}</option>
          {/each}
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 mb-6">
        <button
          onclick={fetchCollectionData}
          disabled={isLoading || !selectedCollection}
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>

        <button
          onclick={downloadExcel}
          disabled={data.length === 0}
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Download Excel
        </button>

        <button
          onclick={downloadFlattenedExcel}
          disabled={data.length === 0}
          class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Download Flattened
        </button>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      {/if}

      <!-- Data Preview -->
      {#if data.length > 0}
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">
            Data Preview ({data.length} records)
          </h2>
          <div class="bg-gray-50 rounded-md p-4 max-h-96 overflow-auto">
            <pre class="text-sm text-gray-700">{JSON.stringify(data.slice(0, 3), null, 2)}</pre>
            {#if data.length > 3}
              <p class="text-sm text-gray-500 mt-2">... and {data.length - 3} more records</p>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Instructions -->
      <div class="bg-blue-50 rounded-md p-4">
        <h3 class="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>1. Update the Firebase configuration with your project details</li>
          <li>2. Modify the availableCollections array to match your Firestore collections</li>
          <li>3. Select a collection and click "Fetch Data" to load the data</li>
          <li>4. Click "Download Excel" for standard format or "Download Flattened" for nested objects</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom styles if needed */
</style>