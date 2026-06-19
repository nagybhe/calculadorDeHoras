<script lang="ts">
	import { browser } from '$app/environment';

	type WorkRecord = {
		id: string;
		name: string;
		task: string;
		day: number;
		month: number;
		year: number;
		hours: number;
		hourlyRate: number;
	};

	const STORAGE_KEY = 'work_hours_records';
	const MONTHLY_GOAL_HOURS = 160;
	const today = new Date();
	const todayDate = formatDateInput(today);
	const todayDateBr = formatDateBr(today);
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

	let records = $state<WorkRecord[]>([]);
	let name = $state('');
	let task = $state('');
	let workDate = $state(todayDate);
	let workDateBr = $state(todayDateBr);
	let hours = $state<number | ''>('');
	let hourlyRate = $state<number | ''>('');
	let selectedMonth = $state(today.getMonth() + 1);
	let selectedYear = $state(today.getFullYear());
	let error = $state('');
	let showClearConfirm = $state(false);
	let calendarInput: HTMLInputElement;

	function formatDateInput(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatDateBr(date: Date) {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function formatIsoToBr(value: string) {
		const [year, month, day] = value.split('-');
		return `${day}/${month}/${year}`;
	}

	function formatDateMask(value: string) {
		const digits = value.replace(/\D/g, '').slice(0, 8);
		const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
		return parts.join('/');
	}

	function parseWorkDateBr(value: string) {
		const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
		if (!match) return null;

		const day = Number(match[1]);
		const month = Number(match[2]);
		const year = Number(match[3]);
		const date = new Date(year, month - 1, day);

		if (
			date.getFullYear() !== year ||
			date.getMonth() !== month - 1 ||
			date.getDate() !== day
		) {
			return null;
		}

		return { day, month, year, date };
	}

	function handleDateInput(event: Event) {
		workDateBr = formatDateMask((event.currentTarget as HTMLInputElement).value);

		const parsedDate = parseWorkDateBr(workDateBr);
		if (parsedDate) {
			workDate = formatDateInput(parsedDate.date);
		}
	}

	function handleCalendarChange(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (!value) return;

		workDate = value;
		workDateBr = formatIsoToBr(value);
	}

	function openCalendar() {
		if (!calendarInput) return;
		const input = calendarInput as HTMLInputElement & { showPicker?: () => void };

		if (input.showPicker) {
			input.showPicker();
			return;
		}

		input.click();
	}

	$effect(() => {
		if (!browser) return;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;

		try {
			records = JSON.parse(stored);
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}
	});

	$effect(() => {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
		}
	});

	const monthlyRecords = $derived(
		records.filter((record) => record.month === selectedMonth && record.year === selectedYear)
	);

	const monthlyHours = $derived(
		monthlyRecords.reduce((total, record) => total + Number(record.hours || 0), 0)
	);

	const totalHours = $derived(records.reduce((total, record) => total + Number(record.hours || 0), 0));
	const monthlyValue = $derived(
		monthlyRecords.reduce(
			(total, record) => total + Number(record.hours || 0) * Number(record.hourlyRate || 0),
			0
		)
	);
	const monthlyProgress = $derived(Math.min((monthlyHours / MONTHLY_GOAL_HOURS) * 100, 100));

	function addRecord() {
		error = '';

		if (!name.trim()) {
			error = 'Informe o nome.';
			return;
		}

		if (!task.trim()) {
			error = 'Informe o nome ou número da tarefa.';
			return;
		}

		const parsedDate = parseWorkDateBr(workDateBr);

		if (!parsedDate) {
			error = 'Informe a data no padrão dd/mm/aaaa.';
			return;
		}

		if (hours === '' || Number(hours) <= 0) {
			error = 'Informe a quantidade de horas.';
			return;
		}

		if (hourlyRate === '' || Number(hourlyRate) < 0) {
			error = 'Informe o valor/hora.';
			return;
		}

		records = [
			...records,
			{
				id: crypto.randomUUID(),
				name: name.trim(),
				task: task.trim(),
				day: parsedDate.day,
				month: parsedDate.month,
				year: parsedDate.year,
				hours: Number(hours),
				hourlyRate: Number(hourlyRate)
			}
		];

		task = '';
		hours = '';
		workDate = formatDateInput(parsedDate.date);
		workDateBr = formatDateBr(parsedDate.date);
		selectedMonth = parsedDate.month;
		selectedYear = parsedDate.year;
	}

	function removeRecord(id: string) {
		records = records.filter((record) => record.id !== id);
	}

	function clearFormFields() {
		name = '';
		task = '';
		hours = '';
		hourlyRate = '';
		workDate = todayDate;
		workDateBr = todayDateBr;
		error = '';
	}

	function clearRecords() {
		showClearConfirm = true;
	}

	function confirmClearRecords() {
		records = [];
		clearFormFields();
		selectedMonth = today.getMonth() + 1;
		selectedYear = today.getFullYear();
		showClearConfirm = false;
	}

	function cancelClearRecords() {
		showClearConfirm = false;
	}

	function escapeCsv(value: string | number) {
		const text = String(value).replace(/"/g, '""');
		return `"${text}"`;
	}

	function formatCurrency(value: number) {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function formatCsvNumber(value: number) {
		return value.toLocaleString('pt-BR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		});
	}

	function getMonthLabel(month: number, year: number) {
		return `${monthNames[month - 1]}/${year}`;
	}

	function getSummaryRows() {
		const groupedRecords = new Map<
			string,
			{
				name: string;
				task: string;
				month: number;
				year: number;
				hours: number;
				value: number;
			}
		>();

		for (const record of records) {
			const key = `${record.name.trim().toLowerCase()}-${record.task.trim().toLowerCase()}-${record.year}-${record.month}`;
			const current = groupedRecords.get(key) ?? {
				name: record.name,
				task: record.task,
				month: record.month,
				year: record.year,
				hours: 0,
				value: 0
			};

			current.hours += Number(record.hours || 0);
			current.value += Number(record.hours || 0) * Number(record.hourlyRate || 0);
			groupedRecords.set(key, current);
		}

		return [...groupedRecords.values()].sort((a, b) => {
			if (a.name !== b.name) return a.name.localeCompare(b.name);
			if (a.task !== b.task) return a.task.localeCompare(b.task);
			if (a.year !== b.year) return a.year - b.year;
			return a.month - b.month;
		});
	}

	function downloadCsv() {
		if (records.length === 0) {
			error = 'Adicione pelo menos um registro antes de exportar.';
			return;
		}

		const header = [
			'Nome do usuário',
			'Nome da tarefa',
			'Mês vigente/atual',
			'Horas trabalhadas'
		];
		const rows = getSummaryRows().map((record) => {
			return [
				record.name,
				record.task,
				getMonthLabel(record.month, record.year),
				formatCsvNumber(record.hours)
			];
		});
		const csv = [header, ...rows]
			.map((row) => row.map((value) => escapeCsv(value)).join(';'))
			.join('\n');

		const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `controle-horas-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	function formatHours(value: number) {
		return value.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
</script>

<svelte:head>
	<title>Sem Runrit - Registro de Horas</title>
</svelte:head>

<main class="min-h-screen bg-slate-950 text-slate-100">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
		<a href="/" class="w-fit text-sm text-slate-400 transition hover:text-white">Voltar para opções</a>

		<div class="flex flex-col gap-2">
			<p class="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Sem Runrit</p>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Registro de horas trabalhadas</h1>
			<p class="max-w-2xl text-slate-400">
				Cadastre nome, tarefa, data, horas e valor/hora. Depois baixe o consolidado no padrão Controle_Horas.csv.
			</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
			<section class="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20">
				<h2 class="mb-4 text-lg font-semibold">Novo registro</h2>

				<form class="grid gap-4" onsubmit={(event) => { event.preventDefault(); addRecord(); }}>
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="grid min-w-0 gap-2 text-sm font-medium text-slate-200">
							Nome
							<input
								bind:value={name}
								class="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
								placeholder="Nome da pessoa"
							/>
						</label>

						<label class="grid min-w-0 gap-2 text-sm font-medium text-slate-200">
							Nome ou número da tarefa
							<input
								bind:value={task}
								class="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
								placeholder="Ex: Ajuste layout ou #123"
							/>
						</label>
					</div>

					<div class="grid gap-4 sm:grid-cols-3">
						<label class="grid min-w-0 gap-2 text-sm font-medium text-slate-200">
							Data
							<div class="relative flex min-w-0">
								<input
									type="text"
									inputmode="numeric"
									maxlength="10"
									bind:value={workDateBr}
									oninput={handleDateInput}
									placeholder="dd/mm/aaaa"
									class="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-14 text-slate-100 outline-none transition focus:border-indigo-400"
								/>
								<button type="button" class="absolute right-1 top-1 flex h-[calc(100%-0.5rem)] w-12 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white" aria-label="Abrir calendário" onclick={openCalendar}>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
									</svg>
								</button>
								<input
									bind:this={calendarInput}
									type="date"
									bind:value={workDate}
									onchange={handleCalendarChange}
									tabindex="-1"
									aria-hidden="true"
									class="pointer-events-none absolute right-1 top-1 h-[calc(100%-0.5rem)] w-12 opacity-0"
								/>
							</div>
						</label>

						<label class="grid min-w-0 gap-2 text-sm font-medium text-slate-200">
							Horas
							<input
								type="number"
								min="0"
								step="0.01"
								bind:value={hours}
								class="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
								placeholder="8"
							/>
						</label>

						<label class="grid min-w-0 gap-2 text-sm font-medium text-slate-200">
							Valor/hora
							<input
								type="number"
								min="0"
								step="0.01"
								bind:value={hourlyRate}
								class="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
								placeholder="50"
							/>
						</label>
					</div>

					{#if error}
						<p class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
					{/if}

					<div class="flex flex-wrap gap-3">
						<button class="rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400" type="submit">
							Adicionar registro
						</button>
						<button class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400" type="button" onclick={downloadCsv}>
							Baixar CSV consolidado
						</button>
						<button class="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800" type="button" onclick={clearRecords}>
							Limpar registros
						</button>
					</div>
				</form>
			</section>

			<aside class="grid gap-4">
				<section class="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">
					<div class="mb-4 flex gap-3">
						<select bind:value={selectedMonth} class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400">
							{#each monthNames as monthName, index}
								<option value={index + 1}>{monthName}</option>
							{/each}
						</select>
						<input
							type="number"
							bind:value={selectedYear}
							class="w-28 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
						/>
					</div>
					<p class="text-sm text-indigo-200">Horas trabalhadas no mês</p>
					<strong class="mt-2 block text-4xl">{formatHours(monthlyHours)}h</strong>
					<p class="mt-2 text-sm text-slate-400">{monthlyRecords.length} registro{monthlyRecords.length === 1 ? '' : 's'} nesse mês.</p>
				</section>

				<section class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
					<p class="text-sm text-emerald-200">Valor do mês</p>
					<strong class="mt-2 block text-3xl">{formatCurrency(monthlyValue)}</strong>
					<p class="mt-2 text-sm text-slate-400">Meta: {MONTHLY_GOAL_HOURS}h</p>
				</section>

				<section class="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
					<p class="text-sm text-violet-200">Progresso mensal</p>
					<strong class="mt-2 block text-3xl">{monthlyProgress.toFixed(0)}%</strong>
					<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
						<div class="h-full rounded-full bg-violet-400" style="width: {monthlyProgress}%"></div>
					</div>
				</section>

				<section class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
					<p class="text-sm text-slate-400">Total geral registrado</p>
					<strong class="mt-2 block text-3xl">{formatHours(totalHours)}h</strong>
				</section>
			</aside>
		</div>

		<section class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
				<h2 class="text-lg font-semibold">Registros</h2>
				<span class="text-sm text-slate-400">{records.length} registro{records.length === 1 ? '' : 's'}</span>
			</div>

			{#if records.length === 0}
				<div class="px-5 py-12 text-center text-slate-400">Nenhum registro adicionado ainda.</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full min-w-[960px] text-left text-sm">
						<thead class="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
							<tr>
								<th class="px-5 py-3">Nome</th>
								<th class="px-5 py-3">Tarefa</th>
								<th class="px-5 py-3">Data</th>
								<th class="px-5 py-3">Horas</th>
								<th class="px-5 py-3">Valor/hora</th>
								<th class="px-5 py-3">Valor</th>
								<th class="px-5 py-3 text-right">Ações</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-800">
							{#each records as record (record.id)}
								<tr class="text-slate-200">
									<td class="px-5 py-4">{record.name}</td>
									<td class="px-5 py-4">{record.task}</td>
									<td class="px-5 py-4">{String(record.day).padStart(2, '0')}/{String(record.month).padStart(2, '0')}/{record.year}</td>
									<td class="px-5 py-4 font-semibold">{formatHours(record.hours)}h</td>
									<td class="px-5 py-4">{formatCurrency(Number(record.hourlyRate || 0))}</td>
									<td class="px-5 py-4 font-semibold text-emerald-300">{formatCurrency(Number(record.hours || 0) * Number(record.hourlyRate || 0))}</td>
									<td class="px-5 py-4 text-right">
										<button class="rounded-lg px-3 py-2 text-red-300 transition hover:bg-red-500/10" onclick={() => removeRecord(record.id)}>
											Remover
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	</section>
</main>

{#if showClearConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm" role="presentation">
		<div class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40" role="dialog" aria-modal="true" aria-labelledby="clear-title">
			<div class="mb-4 flex items-start gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
						<path d="M3 6h18" />
						<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
					</svg>
				</div>
				<div>
					<h2 id="clear-title" class="text-lg font-semibold text-slate-100">Limpar registros?</h2>
					<p class="mt-1 text-sm leading-6 text-slate-400">
						Isso vai apagar os registros salvos e limpar os campos preenchidos no formulário.
					</p>
				</div>
			</div>

			<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button type="button" class="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800" onclick={cancelClearRecords}>
					Cancelar
				</button>
				<button type="button" class="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400" onclick={confirmClearRecords}>
					Limpar registros
				</button>
			</div>
		</div>
	</div>
{/if}
