# Site CRM - Ambiente de Testes

Repositorio do ambiente de testes que concentra duas areas no mesmo frontend:

- landing publica em `/`
- CRM autenticado em `/crm`

Este projeto deve usar somente recursos do ambiente de testes para:

- desenvolvimento local
- execucao de testes
- deploy
- autenticacao
- banco de dados
- webhooks e integracoes externas

## Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Supabase JS
- Tailwind CSS
- Vitest

## Fluxos principais

- Landing publica em `/`
- Login do CRM em `/crm/login`
- Dashboard em `/crm`
- Leads em `/crm/leads`
- Detalhe do lead em `/crm/leads/:id`

## Arquitetura atual

### Separacao entre landing e CRM

- A landing publica continua fora do contexto de auth do CRM.
- O CRM fica isolado dentro da arvore `/crm`, com `AuthProvider`, `ProtectedRoute` e `CrmLayout`.
- As paginas do CRM sao carregadas via lazy loading em `src/App.tsx`, reduzindo acoplamento de bundle entre a landing e a area autenticada.

### Organizacao por feature

O frontend do CRM foi reorganizado em `src/features/crm/`:

- `auth/`: provider, hook, guard, tipos e regras de permissao
- `dashboard/`: documentacao e referencia da area analitica/operacional do CRM
- `leads/list/`: pagina de listagem, toolbar, tabela, kanban, paginacao, estado local e selectors
- `leads/detail/`: pagina de detalhe, cards, paines, drafts e selectors
- `shared/`: tipos compartilhados, query keys, permissoes, constantes e formatters transversais

### Infraestrutura

A camada de infraestrutura do frontend fica em `src/infra/`.

- `src/infra/supabase/client.ts`: client singleton do Supabase para auth e CRM

Os caminhos antigos continuam disponiveis por re-export quando isso reduz risco de migracao, por exemplo:

- `src/lib/supabase.ts`
- `src/types/crm.ts`
- `src/types/dashboard.ts`
- `src/lib/authAccess.ts`

### Query keys compartilhadas

As query keys criticas do CRM foram centralizadas em:

- `src/features/crm/shared/queryKeys/crmQueryKeys.ts`

Os valores permanecem os mesmos do comportamento anterior, incluindo:

- `["crm-leads"]`
- `["crm-leads-task-overview"]`
- `["crm-lead", leadId]`
- `["crm-owner-ids"]`
- `["crm-lead-notes", leadId]`
- `["crm-lead-events", leadId]`
- `["crm-lead-tasks", leadId]`
- `["crm-dashboard", "leads"]`
- `["crm-dashboard", "tasks"]`
- `["crm-dashboard", "events"]`
- `["crm-dashboard", "analytics"]`

## Ambiente

1. Copie `.env.example` para `.env`.
2. Preencha apenas com valores do ambiente de testes.
3. Nunca reutilize URL, chave, webhook, callback ou dominio do ambiente principal neste repositorio.

Variaveis esperadas:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_INTAKE_URL=
VITE_N8N_WEBHOOK_URL=
```

Observacoes:

- `VITE_SUPABASE_INTAKE_URL` e opcional. Quando vazio, a landing usa `${VITE_SUPABASE_URL}/rest/v1/leads`.
- `VITE_N8N_WEBHOOK_URL` e opcional. Se nao houver automacao de testes isolada, deixe vazio.

## Instalacao

```bash
git clone https://github.com/KaduPacheco/Site-CRM-teste.git
cd Site-CRM-teste
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Servidor local padrao: `http://localhost:8080`

## Validacao local

```bash
npm run test
npm run build
```

## Integracoes

### Supabase

- A landing publica grava leads via REST no projeto Supabase do ambiente de testes.
- O CRM usa `supabase-js` com as variaveis publicas do mesmo ambiente de testes para auth, leitura e escrita autenticada.

### n8n

- O webhook e opcional.
- Se existir, deve apontar para uma automacao isolada do ambiente de testes.
- Falhas no webhook nao devem impedir a gravacao principal no banco.

## Observacao operacional

Nao existe arquivo `.vercel/project.json` versionado neste repositorio. O vinculo do deploy deve ser conferido manualmente na Vercel para garantir que o projeto conectado tambem seja o ambiente de testes.
