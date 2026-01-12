<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agenda CRM - Sistema de Gestão para Salões de Beleza

Sistema de agendamento e gestão para salões de beleza com integração Supabase e IA.

View your app in AI Studio: https://ai.studio/apps/drive/1mKGzS4ix9PVmcJwZeQNDWEWizphsQTgv

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Projeto no [Supabase](https://supabase.com) configurado
- Chave de API do [Google Gemini](https://ai.google.dev/)

### Passo 1: Configurar Repositório GitHub

1. Inicialize o repositório Git (se ainda não foi feito):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Crie um novo repositório no GitHub (vazio, sem README)

3. Conecte seu repositório local ao GitHub:
   ```bash
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git branch -M main
   git push -u origin main
   ```

### Passo 2: Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

   | Nome da Variável | Valor | Onde Encontrar |
   |-----------------|-------|----------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase | Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_GEMINI_API_KEY` | Sua chave de API do Gemini | [Google AI Studio](https://ai.google.dev/) |

5. Clique em "Deploy"

### Passo 3: Verificar Deploy

Após o deploy, seu aplicativo estará disponível em uma URL do Vercel (ex: `seu-app.vercel.app`).

**Importante:** A cada push para a branch `main`, o Vercel fará deploy automático das alterações.

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js (versão 18 ou superior)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha com suas credenciais do Supabase e Gemini

4. Execute o servidor de desenvolvimento:
   ```bash
   npm start
   ```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run dev` - Alias para `npm start`
- `npm run build` - Cria build de produção

## 🗄️ Configuração do Supabase

### Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:
- `businesses` - Dados dos negócios/salões
- `professionals` - Profissionais do salão
- `services` - Serviços oferecidos
- `clients` - Clientes cadastrados
- `appointments` - Agendamentos

### Migrações

As migrações do banco de dados devem ser aplicadas no Supabase Dashboard:
1. Acesse seu projeto no Supabase
2. Vá em "SQL Editor"
3. Execute os scripts de migração necessários

## 🔒 Segurança

- ✅ Arquivo `.env` está no `.gitignore` (não será commitado)
- ✅ Use apenas chaves públicas (`anon key`) no código frontend
- ✅ Nunca commite a `service_role_key` no código
- ✅ Configure Row Level Security (RLS) no Supabase

## 📝 Notas Importantes

- As variáveis de ambiente com prefixo `NEXT_PUBLIC_` são injetadas no build e ficam visíveis no navegador (isso é esperado e seguro para chaves públicas)
- A chave `anon key` do Supabase é segura para uso público quando combinada com RLS
- Para produção, sempre use HTTPS (Vercel fornece automaticamente)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no Vercel Dashboard
2. Verifique os logs do Supabase Dashboard
3. Confira se todas as variáveis de ambiente estão configuradas corretamente
