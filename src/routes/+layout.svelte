<!-- src/routes/+layout.svelte -->
<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';
	import { auth } from '$lib/client/firebase'; // Client-side Auth
	import { onAuthStateChanged } from 'firebase/auth';
	import { invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment'; // Ensure this runs only in browser

	let { data, children } = $props();

	// Sync Firebase Auth state with server session cookie
	$effect(() => {
		let unsubscribe = () => {}; // Initialize unsubscribe to a no-op

		if (browser) { // Only run on client
			unsubscribe = onAuthStateChanged(auth, async (user) => {
				console.log('onAuthStateChanged triggered, user:', user ? user.email : null);
				if (user) {
                    // User is signed in (or state changed while signed in)
					const token = await user.getIdToken();
					// Send token to server to ensure session cookie is set/refreshed
                    // Use fetch directly, no need to await this fully here
					fetch('/api/auth/sessionLogin', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ token }),
					}).then(res => {
                        if (!res.ok) console.error("Failed to sync token with server session")
                        // Important: Invalidate data if user state might have changed server-side
                        // Compare current layout data user with Firebase user
                        if (!data.user || data.user.uid !== user.uid) {
                           console.log("Client/server user mismatch, invalidating data...");
                           invalidateAll();
                        }
                    }).catch(err => console.error("Error syncing token:", err));

				} else {
					// User is signed out
					// Send request to server to clear the session cookie
                    // Use fetch directly
					fetch('/api/auth/sessionLogout', { method: 'POST' })
                    .then(res => {
                         if (!res.ok) console.error("Failed to clear server session")
                         // Invalidate data if the layout thinks a user is still logged in
                         if (data.user) {
                             console.log("Client logged out, server might still have user, invalidating data...");
                             invalidateAll();
                         }
                    }).catch(err => console.error("Error clearing session:", err));
				}
			});
		}

		// Cleanup function for the effect
		return () => {
			// console.log('Cleaning up onAuthStateChanged listener');
			unsubscribe();
		};
	}); // No dependencies needed, runs once on mount and cleans up on unmount

</script>

<!-- Rest of the layout template -->
<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-blue-200 dark:selection:bg-blue-800">
	<Header user={data.user} siteName={data.siteName} />
	<main class="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
		{@render children()}
	</main>
	<Footer siteName={data.siteName} />
</div>
