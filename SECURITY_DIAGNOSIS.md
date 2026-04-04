# Diagnóstico e Checklist de Segurança

Este documento lista as melhorias de segurança aplicadas ao repositório React, as justificativas para o que **não** foi alterado, e os requisitos de segurança que dependem da infraestrutura (Backend/Hospedagem).

## 1. Mudanças Aplicadas (Frontend)

| Componente | Mudança | Justificativa de Segurança |
| :--- | :--- | :--- |
| `LeadForm.tsx` | Ocultação avançada do Honeypot (`bot_field`), mudando de `display: none` para `opacity-0 absolute` | Evita que Simple Bots ignorem o campo ao procurar por classes `.hidden` ou visibilidade `none`. |
| `LeadForm.tsx` | Bloqueio de submissão dupla | Previne sobrecarga acidental por cliques múltiplos do usuário e ataques simples de repetição enquanto a requisição carrega. |
| `leadService.ts` | Extração do Webhook do n8n para `.env` | Retira a URL diretamente do arquivo de código (hardcoded), isolando segredos das ferramentas de controle de versão. |
| `leadService.ts` | Defesa contra nulidade (`if (N8N_WEBHOOK_URL)`) | Evita estouros no console e requisições vazias caso o ambiente perca a variável. |

## 2. Itens Não Alterados (Para Preservar Estabilidade)

1. **Acesso do Supabase no Frontend**: A URL e a chave `ANON_KEY` continuam no `.env` expostas ao client. **Isso é esperado no Supabase** se você tiver definido RLS (Row Level Security). Retirar essas chaves do client quebraria a arquitetura atual de client-direto.
2. **Framework e Estrutura DOM**: O formulário continua com a mesma estrutura semantica e acessível. Nenhuma biblioteca de "Captcha" pesada foi introduzida para evitar quebra de fluxo ou rejeição de usuários legítimos sem teste prévio.
3. **Regex de WhatsApp**: A Regex atual (`/^[\d\s()+-]+$/`) foi avaliada e considerada imune a ReDoS (Regular Expression Denial of Service), portanto não foi alterada, não adicionando risco de travamento de navegador.

## 3. Checklist e Dependências de Backend/Infraestrutura

> [!WARNING]
> Como o projeto não possui backend intermediário, a verdadeira limitação de abuso precisa ocorrer nos servidores.

As seguintes ações **devem** ser configuradas fora do código React para garantir segurança total:

- [ ] **Supabase RLS (Row Level Security):** O banco de dados no Supabase deve estar com políticas de RLS ativadas para a tabela `leads` que permita `INSERT` anônimo, mas bloqueie bloqueio de `SELECT`, `UPDATE` e `DELETE`.
- [ ] **Ocultação do Webhook:** O correto não é apontar o front para o n8n. Configure o Supabase para disparar o webhook do n8n via Database Triggers quando uma nova linha for inserida na tabela `leads`. Em seguida, você deve remover completamente o `N8N_WEBHOOK_URL` do repositório React.
- [ ] **Rate Limiting no Cloudflare (WAF):** Como o Supabase não faz rate limit direto fácil por IP em chamadas REST anônimas de inserção, use a proteção do Cloudflare na sua Hospedagem para limitar IPs que dão _post_ repetidos.
- [ ] **Configuração de CORS:** Sua configuração do Supabase deve estar restrita e aceitar _requests_ de domínios específicos de onde sua landing page está hospedada.
- [ ] **Security Headers:** No provedor de hospedagem (Vercel, Netlify, Cloudflare Pages), ative o cabeçalho base `Content-Security-Policy` e `X-Frame-Options: SAMEORIGIN` (evita Clickjacking).
