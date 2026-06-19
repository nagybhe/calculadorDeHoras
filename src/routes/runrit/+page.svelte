<script lang="ts">
	import { goto } from '$app/navigation';
	import { getCurrentUser, validateCredentials } from '$lib/api/runrun';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { auth } from '$lib/stores/auth';

	let appKey = $state('');
	let userToken = $state('');
	let loading = $state(false);
	let error = $state('');

	$effect(() => {
		if ($auth.isAuthenticated) {
			goto('/runrit/dashboard');
		}
	});

	async function handleLogin() {
		if (!appKey.trim() || !userToken.trim()) {
			error = 'Preencha todos os campos';
			return;
		}

		loading = true;
		error = '';

		try {
			const credentials = { appKey: appKey.trim(), userToken: userToken.trim() };
			const isValid = await validateCredentials(credentials);

			if (isValid) {
				const user = await getCurrentUser(credentials);
				auth.login(credentials, user);
				goto('/runrit/dashboard');
			} else {
				error = 'Credenciais inválidas. Verifique sua App-Key e User-Token.';
			}
		} catch {
			error = 'Erro ao conectar com a API. Verifique suas credenciais.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Runrit - Login</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6 text-slate-100">
	<div class="relative z-10 w-full max-w-md">
		<a href="/" class="mb-6 inline-flex text-sm text-slate-400 transition hover:text-white">Voltar para opções</a>

		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-white">
				<svg viewBox="0 0 48 48" fill="none" class="h-10 w-10">
					<circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="3" />
					<path d="M16 24l6 6 12-12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<h1 class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">Runrit</h1>
			<p class="mt-2 text-slate-400">Dashboard com dados do Runrun.it</p>
		</div>

		<Card class="backdrop-blur">
			<form onsubmit={(event) => { event.preventDefault(); handleLogin(); }}>
				<div class="flex flex-col gap-5">
					<Input label="App-Key" placeholder="Sua App-Key do Runrun.it" bind:value={appKey} required />
					<Input type="password" label="User-Token" placeholder="Seu User-Token" bind:value={userToken} required />

					{#if error}
						<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
					{/if}

					<Button type="submit" {loading} class="w-full">
						{loading ? 'Conectando...' : 'Entrar'}
					</Button>
				</div>
			</form>
		</Card>

		<p class="mt-6 text-center text-sm text-slate-400">
			Obtenha suas credenciais em
			<a href="https://runrun.it/api/documentation" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">runrun.it/api/documentation</a>
		</p>
	</div>
</main>
