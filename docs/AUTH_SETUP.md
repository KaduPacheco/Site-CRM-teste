# Configuração do Administrador Inicial (Supabase Auth)

Como a Etapa 2 implementou a autenticação real, você precisa criar o primeiro usuário para acessar o CRM.

## 🚀 Como criar o Admin

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/).
2. Selecione o seu projeto.
3. No menu lateral esquerdo, clique em **Authentication**.
4. Clique no botão **Add User** > **Create new user**.
5. Preencha o **E-mail** e a **Senha**.
6. (Opcional) Desmarque "Send invitation email" se quiser que o usuário fique ativo imediatamente sem confirmar e-mail.
7. Clique em **Confirm**.

## 🔐 Acesso ao Sistema

Após criar o usuário, você poderá acessar:
- **URL**: `http://localhost:5173/crm/login`
- Use as credenciais que você acabou de criar.

## ⚠️ Regras de Segurança
Nesta etapa, qualquer usuário criado no Supabase Auth terá acesso ao `/crm`. Em etapas futuras, implementaremos **Roles (RBAC)** para restringir o acesso apenas a usuários com flag `admin` no banco de dados.
