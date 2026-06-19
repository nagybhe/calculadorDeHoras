# Calculadora de Horas

Aplicacao SvelteKit com dois modos de uso para calcular horas trabalhadas.

## Modos

- **Com Runrit**: login com App-Key e User-Token do Runrun.it para buscar lancamentos via API e calcular horas do mes mais recente.
- **Sem Runrit**: cadastro manual de registros com exportacao em CSV.

## CSV Manual

Campos exportados:

- Nome
- Nome ou numero da tarefa
- Dia
- Mes
- Ano
- Horas

O modo manual tambem mostra o total de horas trabalhadas no mes selecionado e o total geral registrado.

## Como Rodar

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:5173` e escolha uma das opcoes.

## Scripts

- `npm run dev`: inicia o servidor local.
- `npm run build`: gera a build de producao.
- `npm run check`: valida Svelte e TypeScript.
