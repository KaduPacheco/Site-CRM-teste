# Landing Publica

## Objetivo

Registrar o estado atual da landing publica do projeto, deixando claro o escopo da refatoracao recente, os arquivos centrais envolvidos e as restricoes que devem orientar futuras manutencoes.

## Escopo

Esta nota cobre apenas a experiencia publica do frontend:

- home em `/`
- paginas legais publicas em `/politica-de-privacidade` e `/termos-de-uso`
- metadados, SEO e tracking ligados a essas rotas
- captacao de leads iniciada pela landing

Esta nota nao cobre comportamento funcional do CRM autenticado em `/crm`.

## Rotas publicas relacionadas

- `/`: landing principal com proposta comercial, secoes de confianca e captacao
- `/politica-de-privacidade`: pagina institucional publica com informacoes sobre tratamento dos dados enviados pela landing
- `/termos-de-uso`: pagina institucional publica com regras gerais de uso da landing e do formulario

Fonte principal de roteamento: `src/App.tsx`

## Objetivos da refatoracao

- melhorar a clareza comercial da mensagem principal
- aumentar a capacidade de conversao da home publica
- transmitir mais confianca na tomada de decisao comercial
- reforcar SEO e metadados da area publica
- manter a separacao entre area publica e CRM autenticado

## Principais melhorias implementadas

### Estrutura da home

A home publica em `src/pages/HomePage.tsx` hoje funciona assim:

- `Header` sempre renderizado no topo
- `main` com renderizacao condicional:
  - fluxo padrao: `Hero`, `Problems`, `Solution`, `TrustSection`, `Pricing`, `FaqSection` e `LeadForm`
  - fluxo de sucesso: `SuccessView`
- `Footer` sempre renderizado no fechamento da pagina

Quando o formulario conclui com sucesso, `LeadForm` dispara `onSuccess`, `HomePage` alterna o estado local `isSubmitted` e a pagina troca para `SuccessView`.

### Componentes preservados fora do fluxo principal

Os componentes abaixo permanecem no repositorio, mas nao sao renderizados pela home atual:

- `Benefits`
- `Security`
- `FinalCTA`

Eles foram mantidos como referencia editorial e opcao de rollback seguro, sem impacto no runtime da landing atual.

### Confianca e clareza comercial

- a comunicacao da hero e das secoes centrais foi reposicionada para enfase em retrabalho, fechamento da folha, visibilidade da jornada e contexto operacional
- a antiga abordagem de prova social foi substituida na home por `TrustSection`, agora consolidado como bloco unico de confianca, seguranca e criterios de avaliacao
- o formulario e a tela de sucesso foram ajustados para orientar melhor o proximo passo comercial
- a `SuccessView` agora permite retorno explicito para a landing por meio do CTA `Revisar a solucao`, com destino preferencial para `#solucao`

### Navegacao por ancora

O cabecalho da landing aponta para as seguintes secoes atualmente renderizadas:

- `#problemas`
- `#solucao`
- `#precos`
- `#faq`
- `#contato`

Na rota `/`, o `Header` usa essas ancoras locais. Fora da home, ele resolve os mesmos destinos como `/#problemas`, `/#solucao`, `/#precos`, `/#faq` e `/#contato`, mantendo compatibilidade com as paginas legais.

O CTA secundario da hero tambem aponta para `#solucao`, e os CTAs principais de captacao apontam para `#contato`.

### Fluxo de sucesso e retorno

- `LeadForm` envia os dados e, quando o callback `onSuccess` e recebido, a home troca o conteudo principal para `SuccessView`
- `SuccessView` preserva um fallback declarativo com `href="/#solucao"`
- quando `onReviewSolution` esta disponivel, o clique em `Revisar a solucao` previne a navegacao padrao, fecha a tela de sucesso, reexibe a landing e tenta rolar suavemente para `#solucao`
- se a ancora nao existir no DOM, o fallback do fluxo e rolar suavemente para o topo

### SEO da area publica

- `index.html` recebeu ajustes de title, description, keywords, canonical e JSON-LD da aplicacao
- `src/hooks/usePageMeta.ts` centraliza metadados dinamicos de title, description, Open Graph, Twitter e canonical
- `HomePage`, `PrivacyPage` e `TermsPage` usam `usePageMeta` para atualizar metadados por rota

### Paginas legais publicas

- `src/pages/PrivacyPage.tsx` implementa a pagina publica de Politica de Privacidade
- `src/pages/TermsPage.tsx` implementa a pagina publica de Termos de Uso
- `src/components/layout/LegalPageLayout.tsx` fornece o layout compartilhado dessas paginas
- os links para essas paginas aparecem no rodape e no texto de consentimento do formulario

## Compatibilidade preservada

- a landing continua fora da arvore de auth do CRM
- o CRM continua concentrado em `/crm` e nao foi alterado funcionalmente por esta refatoracao
- a captacao de leads continua usando `src/services/leadService.ts`
- o contrato principal de envio continua baseado no endpoint publico configurado do Supabase
- o webhook opcional do n8n continua sendo disparado somente como etapa complementar e nao bloqueante
- o tracking existente continua centralizado em `src/services/analyticsService.ts`
- os tipos de evento atuais permanecem os mesmos:
  - `page_view`
  - `cta_click`
  - `lead_form_start`
  - `lead_form_submit_attempt`
  - `lead_form_submit_success`
  - `lead_form_submit_error`

## Arquivos principais envolvidos

- `index.html`: metadados base da area publica
- `src/App.tsx`: separacao de rotas publicas e do CRM
- `src/pages/HomePage.tsx`: orquestracao da landing principal
- `src/pages/PrivacyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/LegalPageLayout.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Problems.tsx`
- `src/components/sections/Solution.tsx`
- `src/components/sections/TrustSection.tsx`
- `src/components/sections/Pricing.tsx`
- `src/components/sections/FaqSection.tsx`
- `src/components/sections/LeadForm.tsx`
- `src/components/sections/SuccessView.tsx`
- `src/hooks/usePageMeta.ts`
- `src/services/leadService.ts`
- `src/services/analyticsService.ts`
- `src/lib/validations.ts`

Arquivos preservados fora do fluxo principal:

- `src/components/sections/Benefits.tsx`
- `src/components/sections/Security.tsx`
- `src/components/sections/FinalCTA.tsx`

## Restricoes para futuras alteracoes

- nao mover logica do CRM para a area publica nem misturar wrappers de auth nas rotas de landing
- nao renomear nem remover eventos de tracking sem revisar todo o fluxo analitico existente
- nao alterar contratos de envio para Supabase ou webhook do n8n sem validar impacto na captacao atual
- nao documentar prova social, integracoes ou claims comerciais que nao estejam implementados ou sustentados no produto
- manter as paginas legais publicas acessiveis por rota dedicada e referenciadas no rodape e no formulario
- ao alterar SEO da landing, revisar conjuntamente `index.html`, `usePageMeta` e as rotas publicas que definem metadados
