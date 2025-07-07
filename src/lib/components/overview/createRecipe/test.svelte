<!-- src/routes/+page.svelte -->
<script>
  // Use the $state rune to make our data reactive.
  // Any change to this array will automatically update the UI.
  let buttons = $state([
    { id: 1, name: 'Analytics', isToggled: false },
    { id: 2, name: 'Marketing', isToggled: true },
    { id: 3, name: 'User Settings', isToggled: false },
    { id: 4, name: 'Notifications', isToggled: false },
  ]);

  // A simple function to toggle a button's state.
  // With runes, we can directly mutate the state. Svelte handles the rest!
  function toggleButton(button) {
    button.isToggled = !button.isToggled;
  }
</script>

<main class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
  <div class="w-full max-w-md">
    <h1 class="text-4xl font-bold mb-2 text-center text-purple-400">
      Feature Toggles
    </h1>
    <p class="text-gray-400 mb-8 text-center">Click a button to change its color.</p>

    <!-- We use an #each block to loop over our buttons array -->
    <div class="flex flex-col space-y-4">
      {#each buttons as button (button.id)}
        <button
          onclick={() => toggleButton(button)}
          class="
            w-full p-4 rounded-lg font-bold text-white shadow-lg 
            transition-all duration-200 ease-in-out transform hover:scale-105
            {button.isToggled
            ? 'bg-green-600 hover:bg-green-500'
            : 'bg-purple-600 hover:bg-purple-500'}
          "
        >
          {button.name}
        </button>
      {/each}
    </div>
  </div>
</main>