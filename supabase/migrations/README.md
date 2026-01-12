# Supabase Migrations

Este diretório contém as migrações SQL para o banco de dados Supabase do sistema Agenda CRM.

## 📋 Migrações Disponíveis

### 1. `20260111_create_services_table.sql`
**Objetivo:** Criar a tabela de serviços

**O que faz:**
- Cria tabela `services` com campos: id, name, duration, price, status, business_id
- Habilita Row Level Security (RLS)
- Cria política de acesso público (para desenvolvimento)
- Adiciona índices para melhor performance

**Quando executar:** Primeira vez que configurar o banco de dados

---

### 2. `20260111_create_professionals_table.sql`
**Objetivo:** Criar a tabela de profissionais

**O que faz:**
- Cria tabela `professionals` com campos: id, name, email, status, business_id
- Habilita Row Level Security (RLS)
- Cria política de acesso público (para desenvolvimento)
- Adiciona índices para melhor performance

**Quando executar:** Primeira vez que configurar o banco de dados

---

### 3. `20260111_add_birthday_to_clients.sql`
**Objetivo:** Adicionar campo de aniversário aos clientes

**O que faz:**
- Adiciona coluna `birth_date` à tabela `clients`
- Cria índices para consultas de aniversário
- Cria função `get_upcoming_birthdays()` para buscar aniversariantes

**Quando executar:** Após criar as tabelas básicas

---

## 🚀 Como Executar as Migrações

### Passo 1: Acessar o Supabase Dashboard

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `rgopaiangusbhsecbtpg`

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Executar as Migrações

Execute as migrações **na ordem**:

#### Migração 1: Services Table
1. Abra o arquivo `20260111_create_services_table.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Verifique se apareceu "Success. No rows returned"

#### Migração 2: Professionals Table
1. Abra o arquivo `20260111_create_professionals_table.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**
5. Verifique se apareceu "Success. No rows returned"

#### Migração 3: Birthday Field
1. Abra o arquivo `20260111_add_birthday_to_clients.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**
5. Verifique se apareceu "Success. No rows returned"

### Passo 4: Verificar as Tabelas

1. No menu lateral, clique em **Table Editor**
2. Verifique se as seguintes tabelas existem:
   - ✅ `services`
   - ✅ `professionals`
   - ✅ `clients` (com coluna `birth_date`)

---

## ✅ Verificação Pós-Migração

Após executar todas as migrações, você pode verificar se tudo está correto:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'professionals', 'clients');

-- Verificar colunas da tabela clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients';

-- Testar a função de aniversários
SELECT * FROM get_upcoming_birthdays(7);
```

---

## 🔒 Segurança (Importante!)

> [!WARNING]
> **Políticas de RLS em Desenvolvimento**
> 
> As migrações atuais usam políticas RLS permissivas (`USING (true)`) para facilitar o desenvolvimento.
> 
> **Para produção**, você deve atualizar as políticas para:
> - Restringir acesso apenas a usuários autenticados
> - Filtrar por `business_id` do usuário logado
> - Implementar políticas específicas por operação (SELECT, INSERT, UPDATE, DELETE)

### Exemplo de Política de Produção:

```sql
-- Remover política de desenvolvimento
DROP POLICY "Enable all access for services" ON public.services;

-- Criar política restrita
CREATE POLICY "Users can only access their business services" 
ON public.services
FOR ALL 
USING (business_id = auth.jwt() ->> 'business_id')
WITH CHECK (business_id = auth.jwt() ->> 'business_id');
```

---

## 🆘 Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já foi criada. Você pode ignorar este erro ou usar `DROP TABLE` antes de recriar.

### Erro: "column already exists"
**Solução:** A coluna já foi adicionada. Você pode ignorar este erro.

### Erro: "permission denied"
**Solução:** Verifique se você tem permissões de administrador no projeto Supabase.

### Tabelas não aparecem no Table Editor
**Solução:** 
1. Atualize a página (F5)
2. Verifique se a migração foi executada com sucesso
3. Verifique se você está no schema `public`

---

## 📞 Próximos Passos

Após executar as migrações:

1. ✅ Volte para a aplicação
2. ✅ Teste criar um novo serviço
3. ✅ Teste criar um novo profissional
4. ✅ Teste adicionar um cliente com data de nascimento
5. ✅ Verifique se os dados persistem após refresh da página

---

*Migrações criadas em: 11 de Janeiro de 2026*
