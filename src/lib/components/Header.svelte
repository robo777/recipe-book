<!-- src/lib/components/Header.svelte -->
<script>
	import { page } from '$app/stores';
    // --- Firebase Imports for Logout ---
    import { auth } from '$lib/client/firebase';
    import { signOut } from 'firebase/auth';
    // --- Import goto for navigation ---
    import { goto } from '$app/navigation';

	// Svelte 5: Define expected props using $props()
	let { user, siteName } = $props();

	// Helper function to check path matching
	function checkActive(href) {
        const currentPathname = $page.url.pathname;
		return href === '/' ? currentPathname === href : currentPathname.startsWith(href);
	}

    // Use $derived at the top level for each link's state
    let homeActive = $derived(checkActive('/'));
    let dashboardActive = $derived(checkActive('/dashboard'));

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

    // --- UPDATED LOGOUT HANDLER ---
    async function handleLogout() {
        console.log("Logout button clicked");
        try {
            // 1. Tell Firebase JS SDK to sign out
            await signOut(auth);
            console.log('Firebase signOut successful (client-side)');

            // 2. Navigate to the login page
            //    Use replaceState to prevent the logged-out page from being in browser history
            await goto('/login', { replaceState: true });
            console.log('Redirected to /login');

            // 3. NOTE: The onAuthStateChanged listener in +layout.svelte
            //    will *still* run due to the signOut event. It will ensure
            //    the server cookie is cleared and data is invalidated,
            //    making sure the state is correct when the login page loads.

        } catch (error) {
            console.error("Error signing out: ", error);
            // Optionally display an error message to the user
            // Maybe don't redirect if signout fails?
        }
    }
    // --- END LOGOUT HANDLER ---

</script>

<header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
	<nav class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
		<div class="flex items-center justify-between h-16">
            <!-- ... logo / site name ... -->
            <!-- ... desktop nav links ... -->

			<!-- Desktop Login/Logout -->
			<div class="hidden md:flex md:items-center md:space-x-6">
                <!-- ... Home/Dashboard links ... -->

				{#if user}
					<span class="text-sm text-gray-600 dark:text-gray-400">Hi, {user.name}</span>
                    <button
                        onclick={handleLogout} 
                        type="button"
                        class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Logout
                    </button>
				{:else}
					<a href="/login" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
						Login
					</a>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden flex items-center">
				<button onclick={toggleMobileMenu} type="button" class="..." aria-controls="mobile-menu" aria-expanded={mobileMenuOpen}>
					<!-- ... hamburger/close icons ... -->
				</button>
			</div>
		</div>

        <!-- Mobile Menu -->
        {#if mobileMenuOpen}
            <div class="md:hidden border-t border-gray-200 dark:border-gray-700" id="mobile-menu">
                <!-- ... mobile nav links ... -->

                <!-- User info / Logout Button in mobile menu -->
                <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    {#if user}
                        <!-- ... user info ... -->
                        <div class="mt-3 space-y-1">
                            <button
                                onclick={handleLogout} 
                                type="button"
                                class="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    {:else}
                        <!-- Link to the login page -->
                        <div class="space-y-1">
                            <a href="/login" class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Login</a>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
	</nav>
</header>