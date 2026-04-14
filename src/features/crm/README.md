# CRM Features

Esta pasta concentra a arquitetura atual do frontend do CRM organizada por feature.

Objetivo desta organizacao:

- separar claramente autenticacao, dashboard, leads e shared;
- manter contratos publicos estaveis via re-export quando necessario;
- reduzir acoplamento entre landing publica e area autenticada do CRM.

Organizacao atual:

- `auth/`: autenticacao, guards e contexto de acesso do CRM.
- `dashboard/`: documentacao e referencia da area de dashboard, com service externo mantendo a fachada atual.
- `leads/list/`: workspace da lista de leads, filtros, tabela, kanban e paginacao.
- `leads/detail/`: detalhe do lead, timeline, notas, tasks e mutacoes.
- `shared/`: tipos, query keys, permissoes, constantes e formatters reutilizados entre features do CRM.

Notas arquiteturais:

- a landing publica continua fora desta pasta;
- o CRM continua protegido por `AuthProvider` + `ProtectedRoute`;
- as paginas do CRM sao lazy-loaded em `src/App.tsx`;
- `src/infra/` concentra adaptadores de infraestrutura como o client do Supabase.
