# Configuracao do Administrador Inicial

Use este procedimento somente no projeto Supabase do ambiente de testes ligado a este repositorio.

## Como criar o primeiro usuario

1. Acesse `https://app.supabase.com/`.
2. Selecione apenas o projeto Supabase do ambiente de testes.
3. Abra `Authentication`.
4. Clique em `Add User` > `Create new user`.
5. Preencha e-mail e senha.
6. Se quiser ativacao imediata, desmarque o envio de convite por e-mail.
7. Confirme a criacao.

## Acesso local

- URL local: `http://localhost:8080/crm/login`
- Use as credenciais criadas no projeto de testes.

## Regras de seguranca

- Nao crie usuarios administrativos no projeto principal a partir deste fluxo.
- Se houver deploy na Vercel para testes, mantenha no Supabase Auth apenas URLs, dominios e callbacks do ambiente de testes.
- Nao reutilize `Site URL`, `Redirect URLs` ou templates de e-mail do ambiente principal neste projeto.
