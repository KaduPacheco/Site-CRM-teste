# CRM Leads

Agrupa a estrutura atual da feature de leads do CRM.

Subareas:

- `list/`: pagina de listagem, filtros, ordenacao, tabela, kanban e paginacao.
- `detail/`: workspace do lead, timeline, notas, ownership e pipeline.

Estado atual:

- `list/` concentra estado local, selectors e componentes da listagem
- `detail/` concentra a composicao da pagina e seus paines menores
- os caminhos legados em `src/pages/crm/LeadsPage.tsx` e `src/pages/crm/LeadDetailPage.tsx` seguem disponiveis por re-export
