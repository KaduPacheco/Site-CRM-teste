# CRM Dashboard

Referencia da area de dashboard do CRM.

Estado atual:

- a pagina continua em `src/pages/crm/DashboardPage.tsx`
- os componentes visuais continuam em `src/components/crm/dashboard/`
- os datasets e builders continuam expostos por `src/services/dashboardService.ts`
- internamente, o dashboard service foi fatiado em:
  - `src/services/dashboard/dashboard.api.ts`
  - `src/services/dashboard/dashboard.selectors.ts`
  - `src/services/dashboard/dashboard.constants.ts`
  - `src/services/dashboard/dashboard.formatters.ts`

Motivacao:

- manter o contrato publico do dashboard estavel para a pagina e componentes
- separar acesso a dados, constantes, agregacoes e labels/helpers
- reduzir risco de regressao sem mover comportamento de negocio
