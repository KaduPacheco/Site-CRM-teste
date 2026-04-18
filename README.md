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
- Politica de Privacidade em `/politica-de-privacidade`
- Termos de Uso em `/termos-de-uso`
- Login do CRM em `/crm/login`
- Dashboard em `/crm`
- Analytics em `/crm/analytics`
- Operacao em `/crm/operacao`
- Leads em `/crm/leads`
- Detalhe do lead em `/crm/leads/:id`

## Refatoracao recente da landing publica

A landing publica em `/` passou por uma refatoracao focada em comunicacao comercial, conversao, confianca e SEO da area publica, sem reposicionar o CRM nem alterar contratos da captacao existente.

O que mudou na area publica:

- reposicionamento da mensagem comercial da home para enfatizar clareza operacional, proposta de valor e proximos passos do contato
- reorganizacao das secoes da landing com foco em problemas, solucao, beneficios, confianca, precos, seguranca, FAQ, CTA final e formulario
- inclusao das paginas publicas de `Politica de Privacidade` e `Termos de Uso`, ambas roteadas em `src/App.tsx`
- reforco de SEO da area publica com metadados por pagina via `src/hooks/usePageMeta.ts` e ajustes de metadados base em `index.html`

O que foi preservado:

- a separacao estrutural entre landing publica em `/` e CRM autenticado em `/crm`
- a captacao de leads da landing por `src/services/leadService.ts`, incluindo envio principal ao Supabase e webhook opcional do n8n
- o tracking existente da landing em `src/services/analyticsService.ts`, sem remocao dos tipos de evento ja usados
- o comportamento funcional do CRM, que continua isolado por `AuthProvider`, `ProtectedRoute` e `CrmLayout`

Observacao importante:

- esta etapa documenta uma refatoracao da area publica; o CRM nao foi alterado funcionalmente por esse trabalho
- detalhes tecnicos adicionais da area publica estao em `docs/LANDING_PUBLICA.md`

## Arquitetura atual

### Separacao entre landing e CRM

- A landing publica continua fora do contexto de auth do CRM.
- O CRM fica isolado dentro da arvore `/crm`, com `AuthProvider`, `ProtectedRoute` e `CrmLayout`.
- As paginas do CRM sao carregadas via lazy loading em `src/App.tsx`, reduzindo acoplamento de bundle entre a landing e a area autenticada.

### Organizacao por feature

O frontend do CRM foi reorganizado em `src/features/crm/`:

- `auth/`: provider, hook, guard, tipos e regras de permissao
- `dashboard/`: dashboard executivo, atalhos, atividade e prioridades
- `analytics/`: leitura de aquisicao, conversao, funil e canais
- `operacao/`: leitura comercial da carteira, pipeline e distribuicoes
- `leads/list/`: pagina de listagem, toolbar, tabela, kanban, paginacao, estado local e selectors
- `leads/detail/`: pagina de detalhe, cards, paines, drafts e selectors
- `shared/`: tipos compartilhados, query keys, permissoes, constantes e formatters transversais

## Arquitetura por area

### Landing publica

- rota: `/`
- papel: captacao publica de leads e tracking da landing
- servicos principais:
  - `src/services/leadService.ts`
  - `src/services/analyticsService.ts`

### Dashboard

- rota: `/crm`
- papel: visao geral executiva
- foco: situacao atual, alertas, atividade recente, follow-ups e atalhos operacionais

### Analytics

- rota: `/crm/analytics`
- papel: leitura analitica da aquisicao
- foco: performance da landing, conversao por periodo, funil, trafego, canais e origem

### Operacao

- rota: `/crm/operacao`
- papel: leitura comercial da carteira
- foco: pipeline, distribuicao por estagio, distribuicao por origem comercial e acompanhamento da execucao

### Leads

- rota: `/crm/leads`
- papel: workspace operacional da base
- foco: filtros, tabela, kanban, detalhe do lead, notas, tarefas, ownership e timeline

### Infraestrutura

A camada de infraestrutura do frontend fica em `src/infra/`.

- `src/infra/supabase/client.ts`: client singleton do Supabase para auth e CRM
- `src/infra/supabase/env.ts`: leitura tipada e validacao das variaveis publicas do Supabase

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

### Permissoes do CRM

O CRM reutiliza a modelagem existente de papeis e permissoes no frontend, sem sistema paralelo de autorizacao.

Permissoes atualmente reconhecidas:

- `crm:access`
- `crm:dashboard:read`
- `crm:leads:read`
- `crm:leads:write`
- `crm:notes:write`
- `crm:tasks:write`

Aplicacao atual:

- `/crm`, `/crm/analytics` e `/crm/operacao`
  - exigem `crm:dashboard:read`
- `/crm/leads` e `/crm/leads/:id`
  - exigem `crm:leads:read`
- acoes de etapa e ownership no detalhe do lead
  - exigem `crm:leads:write`
- anotacoes no detalhe do lead
  - exigem `crm:notes:write`
- tarefas e follow-ups no detalhe do lead
  - exigem `crm:tasks:write`

Quando uma rota protegida falha por permissao, o frontend usa um fallback seguro calculado a partir do conjunto de permissoes disponivel no usuario autenticado.

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

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` sao obrigatorias para a landing e para o CRM autenticado.
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
- A validacao dessas envs publicas foi centralizada em `src/infra/supabase/env.ts` para reduzir falhas silenciosas de configuracao.

### n8n

- O webhook e opcional.
- Se existir, deve apontar para uma automacao isolada do ambiente de testes.
- Falhas no webhook nao devem impedir a gravacao principal no banco.

## Observacao operacional

Nao existe arquivo `.vercel/project.json` versionado neste repositorio. O vinculo do deploy deve ser conferido manualmente na Vercel para garantir que o projeto conectado tambem seja o ambiente de testes.
