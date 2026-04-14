# CRM Shared

Area compartilhada entre features do CRM.

Conteudo atual:

- `types/`
  - contratos compartilhados de CRM, dashboard e auth access
- `permissions/`
  - regras puras de autorizacao do frontend
- `queryKeys/`
  - chaves centralizadas do cache do CRM
- `constants/`
  - constantes transversais como rotas do CRM
- `formatters/`
  - formatadores compartilhados de apresentacao

Compatibilidade:

- os caminhos antigos de tipos e auth continuam existindo por re-export quando isso reduz risco
- os valores publicos de query keys e contratos foram preservados
