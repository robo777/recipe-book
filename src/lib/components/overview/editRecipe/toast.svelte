
<!-- Toast.svelte -->
<script>
  let { message = '', type = 'info', show = $bindable(false), duration = 93000 } = $props();
  
  let timeoutId = $state();
  
  $effect(() => {
    if (show) {
      timeoutId = setTimeout(() => {
        show = false;
      }, duration);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
  
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };
</script>

{#if show}
  <div 
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] px-6 py-3 rounded-lg shadow-2xl min-w-80 max-w-96 {typeStyles[type]} transition-all duration-300 ease-in-out"
    role="alert"
    style="position: fixed !important;"
  >
    <div class="flex items-center justify-between gap-3">
      <span class="flex-1">{message}</span>
      <button 
        onclick={() => show = false}
        class="text-xl font-bold hover:opacity-70 transition-opacity ml-2 flex-shrink-0"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  </div>
{/if}
