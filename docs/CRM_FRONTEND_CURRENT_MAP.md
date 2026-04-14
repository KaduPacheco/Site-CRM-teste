# CRM Frontend Current Map

## Objetivo desta nota

Registrar a arquitetura final do frontend do CRM apos a reorganizacao por feature, preservando uma referencia tecnica unica para futuras manutencoes.

## Topologia geral

- `/`:
  landing publica fora da arvore de auth do CRM.
- `/crm/login`:
  pagina de login do CRM dentro do `AuthProvider`, mas sem `ProtectedRoute`.
- `/crm`:
  dashboard autenticado do CRM.
- `/crm/leads`:
  workspace principal da listagem de leads.
- `/crm/leads/:id`:
  detalhe operacional do lead.
- `*`:
  fallback global para `NotFoundPage`.

Fonte principal: [src/App.tsx](/c:/Users/cadup/Documents/PROJETOGPT/Site-CRM/src/App.tsx)

## Arvore de rotas do CRM

1. `QueryClientProvider`
2. `TooltipProvider`
3. `BrowserRouter`
4. rota `/crm`
5. `AuthProvider`
6. rota `login`
7. `ProtectedRoute`
8. `CrmLayout`
9. paginas lazy de dashboard, leads e detalhe

Pontos preservados:

- `AuthProvider` continua acima de login e da area protegida.
- `ProtectedRoute` continua protegendo apenas as rotas autenticadas.
- `CrmLayout` continua encapsulando dashboard, leads e detalhe.
- O lazy loading foi aplicado apenas nas paginas do CRM, sem alterar a ordem dos wrappers.

## Organizacao final por feature

### `src/features/crm/auth`

Responsavel por autenticacao e autorizacao do CRM:

- `providers/AuthProvider.tsx`
- `hooks/useAuth.ts`
- `components/ProtectedRoute.tsx`
- `lib/authAccess.ts`
- `types/auth-access.ts`
- `types/auth-context.ts`

Compatibilidade legada mantida por re-export:

- `src/contexts/AuthContext.tsx`
- `src/contexts/auth-context.ts`
- `src/hooks/useAuth.ts`
- `src/components/auth/ProtectedRoute.tsx`
- `src/lib/authAccess.ts`

### `src/features/crm/leads/list`

Responsavel pela listagem de leads:

- `page/LeadsPage.tsx`
- `components/LeadsWorkspaceToolbar.tsx`
- `components/LeadsResultsTable.tsx`
- `components/LeadsKanbanBoard.tsx`
- `components/LeadsPaginationControls.tsx`
- `hooks/useLeadsListState.ts`
- `selectors/leadListSelectors.ts`

### `src/features/crm/leads/detail`

Responsavel pelo detalhe/workspace do lead:

- `page/LeadDetailPage.tsx`
- componentes de header, identidade, pipeline/ownership, tasks, timeline, quick note e resumo operacional
- `hooks/useLeadDetailDrafts.ts`
- `selectors/leadDetailSelectors.ts`

### `src/features/crm/shared`

Nucleo compartilhado do CRM:

- `types/`: `crm.ts`, `dashboard.ts`, `auth-access.ts`
- `permissions/`: `authAccess.ts`
- `queryKeys/`: `crmQueryKeys.ts`
- `constants/`: `routes.ts`
- `formatters/`: `dateTime.ts`

## Infraestrutura

### `src/infra`

Camada de infraestrutura reutilizavel:

- `supabase/client.ts`: client singleton do Supabase

Compatibilidade preservada:

- [src/lib/supabase.ts](/c:/Users/cadup/Documents/PROJETOGPT/Site-CRM/src/lib/supabase.ts) continua existindo como fachada segura

## Servicos e contratos

Os services permanecem como camada de acesso a dados e nao foram reorganizados para dentro de `features`:

- [src/services/crmService.ts](/c:/Users/cadup/Documents/PROJETOGPT/Site-CRM/src/services/crmService.ts)
- [src/services/dashboardService.ts](/c:/Users/cadup/Documents/PROJETOGPT/Site-CRM/src/services/dashboardService.ts)

No dashboard, o service foi fatiado internamente, mas segue exposto por uma fachada de compatibilidade em `src/services/dashboardService.ts`.

## Query keys criticas

As query keys foram centralizadas em:

- [src/features/crm/shared/queryKeys/crmQueryKeys.ts](/c:/Users/cadup/Documents/PROJETOGPT/Site-CRM/src/features/crm/shared/queryKeys/crmQueryKeys.ts)

Valores preservados:

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

## Regras de compatibilidade preservadas

- O CRM continua separado da landing publica na arvore de rotas.
- O auth flow continua usando sessao inicial + `onAuthStateChange` do Supabase.
- `buildAuthAccess` continua sendo a fonte de verdade de permissao no frontend.
- `useLeadWorkspace` continua invalidando as mesmas query keys.
- Tipos compartilhados continuam acessiveis pelos caminhos legados `src/types/crm.ts` e `src/types/dashboard.ts`.
- Helpers antigos continuam disponiveis por fachadas e re-exports quando isso reduz risco de migracao.

## Lazy loading do CRM

As paginas abaixo sao carregadas via `React.lazy`:

- `LoginPage`
- `DashboardPage`
- `LeadsPage`
- `LeadDetailPage`

O fallback continua simples e seguro, sem alterar fluxo de sessao, redirecionamento ou layout.
