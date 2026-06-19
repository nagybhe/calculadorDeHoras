<svelte:head>
	<title>Calculadora de Horas</title>
</svelte:head>

<main class="min-h-screen bg-slate-950 text-slate-100">
	<section class="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-4 py-10">
		<div class="max-w-3xl">
			<p class="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Calculadora de horas</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Escolha como quer registrar as horas</h1>
			<p class="mt-4 text-lg text-slate-400">
				Use o Runrit para buscar horas direto do Runrun.it ou preencha manualmente para gerar um CSV.
			</p>
		</div>

		<div class="grid gap-5 md:grid-cols-2">
			<a
				href="/runrit"
				class="group rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-500/20"
			>
				<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white">
					<svg viewBox="0 0 32 32" fill="none" class="h-8 w-8">
						<circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" />
						<polyline points="10,16 14,20 22,12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold">Com Runrit</h2>
				<p class="mt-3 text-slate-300">
					Login com App-Key e User-Token para calcular horas a partir dos lançamentos do Runrun.it.
				</p>
				<span class="mt-6 inline-flex font-semibold text-indigo-200 group-hover:text-white">Entrar com Runrit</span>
			</a>

			<a
				href="/csv"
				class="group rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-500/20"
			>
				<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-8 w-8">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14,2 14,8 20,8" />
						<line x1="8" y1="13" x2="16" y2="13" />
						<line x1="8" y1="17" x2="16" y2="17" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold">Sem Runrit</h2>
				<p class="mt-3 text-slate-300">
					Cadastro manual com nome, tarefa, dia, mês, ano e horas, com exportação em CSV.
				</p>
				<span class="mt-6 inline-flex font-semibold text-emerald-200 group-hover:text-white">Gerar CSV manual</span>
			</a>
		</div>
	</section>
</main>
