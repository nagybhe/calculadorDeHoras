<script lang="ts">
	import { browser } from '$app/environment';
	import { getManualWorkPeriods, formatSecondsToHours, type ManualWorkPeriod } from '$lib/api/runrun';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let totalSeconds = $state(0);
	let loading = $state(true);
	let error = $state('');
	let displayMonth = $state('');
	let valorHora = $state(browser ? Number(localStorage.getItem('valorHora')) || 0 : 0);

	const valorTotal = $derived((totalSeconds / 3600) * valorHora);
	const expectedMonthlySeconds = 176 * 3600;
	const progressPercentage = $derived(Math.min((totalSeconds / expectedMonthlySeconds) * 100, 100));
	const monthNames = [
		'Janeiro',
		'Fevereiro',
		'Março',
		'Abril',
		'Maio',
		'Junho',
		'Julho',
		'Agosto',
		'Setembro',
		'Outubro',
		'Novembro',
		'Dezembro'
	];

	$effect(() => {
		if (browser) {
			localStorage.setItem('valorHora', String(valorHora));
		}
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	async function fetchHours() {
		const credentials = $auth.credentials;
		const userId = $auth.user?.id;
		if (!credentials || !userId) return;

		loading = true;
		error = '';

		try {
			const limit = 100;
			let allPeriods: ManualWorkPeriod[] = [];
			let hasMore = true;

			for (let page = 1; hasMore; page++) {
				const periods = await getManualWorkPeriods(credentials, {
					user_id: userId,
					limit,
					page
				});

				allPeriods = [...allPeriods, ...periods];
				hasMore = periods.length === limit;
			}

			if (allPeriods.length > 0) {
				const getMonthYear = (dateStr: string) => {
					const [year, month] = dateStr.split('-').map(Number);
					return { year, month: month - 1 };
				};

				const monthYears = allPeriods.map((period) => getMonthYear(period.date_to_apply));
				const mostRecent = monthYears.reduce((a, b) => {
					if (a.year > b.year) return a;
					if (a.year < b.year) return b;
					return a.month > b.month ? a : b;
				});

				displayMonth = `${monthNames[mostRecent.month]} ${mostRecent.year}`;

				const targetPrefix = `${mostRecent.year}-${String(mostRecent.month + 1).padStart(2, '0')}`;
				const filteredPeriods = allPeriods.filter((period) => period.date_to_apply.startsWith(targetPrefix));

				totalSeconds = filteredPeriods.reduce((sum, period) => {
					const seconds = period.seconds || 0;
					if (seconds < 0 && period.board_stage_name === 'Doing') {
						return sum;
					}

					return sum + seconds;
				}, 0);
			} else {
				displayMonth = 'Sem lançamentos';
				totalSeconds = 0;
			}
		} catch {
			error = 'Erro ao carregar horas';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchHours();
	});
</script>

<div class="rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-900/30 p-6">
	<div class="mb-6 flex items-center gap-3">
		<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
			<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12,6 12,12 16,14" />
			</svg>
		</div>
		<div>
			<h3 class="text-base font-semibold text-slate-100">Horas Trabalhadas</h3>
			<p class="text-sm text-slate-400">{displayMonth || 'Carregando...'}</p>
		</div>
	</div>

	{#if loading}
		<div class="flex flex-col items-center gap-4 py-8 text-slate-400">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
			<span>Carregando...</span>
		</div>
	{:else if error}
		<div class="flex flex-col items-center gap-4 py-8 text-slate-400">
			<span>{error}</span>
			<button class="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-600" onclick={fetchHours}>
				Tentar novamente
			</button>
		</div>
	{:else}
		<div class="space-y-5">
			<div class="flex w-fit items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2">
				<label for="valorHora" class="whitespace-nowrap text-xs text-slate-400">Valor/hora:</label>
				<div class="relative w-24">
					<span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
					<input
						id="valorHora"
						type="number"
						min="0"
						step="0.01"
						bind:value={valorHora}
						placeholder="0"
						class="w-full rounded border border-emerald-500/40 bg-slate-800 py-1 pl-7 pr-1 text-sm text-slate-100 transition-colors focus:border-emerald-400 focus:outline-none"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
					<span class="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold leading-none text-transparent">
						{formatSecondsToHours(totalSeconds)}
					</span>
					<span class="mt-1 block text-xs text-slate-500">horas trabalhadas</span>
				</div>

				<div class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
					<span class="block text-3xl font-bold leading-none text-emerald-400">{formatCurrency(valorTotal)}</span>
					<span class="mt-1 block text-xs text-slate-500">valor do mês</span>
				</div>
			</div>

			<div class="rounded-xl bg-slate-900 p-4">
				<div class="mb-2 flex justify-between text-sm text-slate-400">
					<span>Progresso mensal</span>
					<span>{progressPercentage.toFixed(1)}%</span>
				</div>
				<div class="h-2 overflow-hidden rounded-full bg-slate-700">
					<div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style="width: {progressPercentage}%"></div>
				</div>
				<p class="mt-2 text-center text-xs text-slate-500">Meta mensal: 176h (22 dias x 8h)</p>
			</div>

			<div class="grid grid-cols-3 gap-3">
				<div class="rounded-xl bg-slate-900 p-3 text-center">
					<span class="block text-2xl font-semibold text-slate-100">{Math.floor(totalSeconds / 3600)}</span>
					<span class="mt-1 block text-xs text-slate-400">Horas</span>
				</div>
				<div class="rounded-xl bg-slate-900 p-3 text-center">
					<span class="block text-2xl font-semibold text-slate-100">{Math.floor((totalSeconds % 3600) / 60)}</span>
					<span class="mt-1 block text-xs text-slate-400">Minutos</span>
				</div>
				<div class="rounded-xl bg-slate-900 p-3 text-center">
					<span class="block text-2xl font-semibold text-slate-100">{(totalSeconds / 3600 / 8).toFixed(1)}</span>
					<span class="mt-1 block text-xs text-slate-400">Dias</span>
				</div>
			</div>
		</div>
	{/if}
</div>
