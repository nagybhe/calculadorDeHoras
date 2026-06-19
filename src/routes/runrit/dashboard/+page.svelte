<script lang="ts">
	import { goto } from '$app/navigation';
	import HoursCard from '$lib/components/HoursCard.svelte';
	import { auth } from '$lib/stores/auth';

	$effect(() => {
		if (!$auth.isAuthenticated) {
			goto('/runrit');
		}
	});

	function handleLogout() {
		auth.logout();
		goto('/runrit');
	}

	function refreshPage() {
		window.location.reload();
	}

	const userName = $derived($auth.user?.name || 'Usuário');
	const greeting = $derived(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Bom dia';
		if (hour < 18) return 'Boa tarde';
		return 'Boa noite';
	});
</script>

<svelte:head>
	<title>Runrit - Dashboard</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-900">
	<header class="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
		<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
			<div class="flex items-center gap-4">
				<a href="/" aria-label="Voltar para opções" class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-indigo-400 transition hover:bg-slate-700">
					<svg viewBox="0 0 32 32" fill="none" class="h-8 w-8">
						<circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" />
						<polyline points="10,16 14,20 22,12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</a>
				<div>
					<h1 class="text-lg font-semibold text-slate-100">
						{greeting()}, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userName}</span>
					</h1>
					<p class="text-sm text-slate-400">Gerencie suas horas trabalhadas via Runrit</p>
				</div>
			</div>

			<div class="flex gap-2">
				<button class="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white" onclick={refreshPage}>
					Atualizar
				</button>
				<button class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600" onclick={handleLogout}>
					Sair
				</button>
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
		<div class="mx-auto max-w-2xl">
			<HoursCard />
		</div>
	</main>

	<footer class="py-6 text-center text-sm text-slate-500">
		Dados do <a href="https://runrun.it" target="_blank" rel="noopener" class="text-indigo-400 hover:underline">Runrun.it</a>
	</footer>
</div>
