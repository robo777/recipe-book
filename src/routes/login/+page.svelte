<!-- src/routes/login/+page.svelte -->
<script>
	// ... (rest of your script imports) ...
	import { auth, googleProvider } from '$lib/client/firebase';
	import { signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data: rootData } = $props();
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loadingEmail = $state(false);
	let loadingGoogle = $state(false);
	let redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/dashboard');

	$effect(() => {
		if (rootData.user) {
			console.log('User already logged in, redirecting from /login');
			goto(redirectTo, { replaceState: true });
		}
	});

	async function handleSuccessfulLogin() {
		await invalidateAll();
		goto(redirectTo, { replaceState: true });
	}

	// VVVV MODIFIED FUNCTION SIGNATURE & ADDED preventDefault VVVV
	async function handleEmailLogin(event) {
        event.preventDefault(); // <-- Call preventDefault manually
    // ^^^^ Accept the 'event' object ^^^^

		if (!email || !password) {
			error = 'Please enter both email and password.';
			return;
		}
		loadingEmail = true;
		error = '';
		try {
            await setPersistence(auth, browserLocalPersistence);
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const idToken = await userCredential.user.getIdToken();

			const response = await fetch('/api/auth/sessionLogin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: idToken }),
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || 'Failed to create server session.');
			}

			await handleSuccessfulLogin();
		} catch (err) {
			console.error('Email Login Error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                 error = 'Invalid email or password.';
            } else if (err.code === 'auth/invalid-email') {
                 error = 'Please enter a valid email address.';
            } else {
			    error = err.message || 'Login failed. Please try again.';
            }
		} finally {
			loadingEmail = false;
		}
	}

    async function handleGoogleLogin() { // No event needed here as it's a button click
        loadingGoogle = true;
        error = '';
        try {
            await setPersistence(auth, browserLocalPersistence);
			const result = await signInWithPopup(auth, googleProvider);
			const idToken = await result.user.getIdToken();
            const response = await fetch('/api/auth/sessionLogin', {
                 method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: idToken }),
            });
             if (!response.ok) {
                const result = await response.json();
				throw new Error(result.message || 'Failed to create server session.');
             }
            await handleSuccessfulLogin();
        } catch (err) {
            console.error('Google Login Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                error = 'Login cancelled.';
            } else {
			    error = err.message || 'Google Sign-in failed.';
            }
        } finally {
             loadingGoogle = false;
        }
    }
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
			Sign in to your account
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
		<!-- VVVV CORRECTED LINE: Use onsubmit (no colon), no modifier VVVV -->
		<form class="space-y-6" method="POST" onsubmit={handleEmailLogin}>
            <!-- ^^^^ Changed on:submit|preventDefault to onsubmit ^^^^ -->

            <!-- ... email input ... -->
            <div>
				<label for="email" class="...">Email address</label>
				<div class="mt-2">
					<input id="email" name="email" type="email" bind:value={email} required class="..." disabled={loadingEmail || loadingGoogle}/>
				</div>
			</div>

            <!-- ... password input ... -->
			<div>
				<label for="password" class="...">Password</label>
				<div class="mt-2">
					<input id="password" name="password" type="password" bind:value={password} required class="..." disabled={loadingEmail || loadingGoogle}/>
				</div>
			</div>

            <!-- ... error message ... -->
            {#if error}
                <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
            {/if}

            <!-- ... submit button ... -->
			<div>
				<button type="submit" class="..." disabled={loadingEmail || loadingGoogle}>
                    {#if loadingEmail}
                        <svg class="animate-spin ..."></svg> Signing in...
                    {:else}
					    Sign in
                    {/if}
				</button>
			</div>
		</form>

		<!-- ... Or continue with / Google Button ... -->
        <div class="mt-6">
            <!-- ... separator ... -->
             <div class="mt-6 grid grid-cols-1 gap-4">
                <!-- NOTE: onclick={handleGoogleLogin} is already correct syntax -->
				<button onclick={handleGoogleLogin} disabled={loadingEmail || loadingGoogle} class="...">
                    {#if loadingGoogle}
                         <svg class="animate-spin ..."></svg> Processing...
                    {:else}
					    <svg class="h-5 w-5 ..."></svg> <!-- Google Icon -->
					    <span class="text-sm font-semibold leading-6">Google</span>
                    {/if}
				</button>
             </div>
        </div>
	</div>
</div>