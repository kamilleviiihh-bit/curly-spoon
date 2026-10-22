# Curly Spoon — Crie seu 1° curriculo!

Projeto Next.js com App Router e JavaScript, preparado para publicar na Vercel.

## Rodar localmente

1. Instale o Node.js 22 ou superior.
2. Abra um terminal na pasta do projeto e execute `npm ci`.
3. Execute `npm run dev`.
4. Abra http://localhost:3000.

## Personalização

- Textos da página: constantes no início de `app/page.js`.
- Título da aba do navegador e descrição: `app/layout.js`.
- Cores e estilos: `app/globals.css` (variáveis no início do arquivo).

## Publicar na Vercel

Importe este repositório na Vercel, selecione Next.js e clique em Deploy. Não é necessário configurar variáveis de ambiente.

Para verificar a compilação de produção, execute `npm run build`.
Para executá-la localmente depois de compilar, execute `npm start`.

Nesta primeira versão, o botão **Analisar** apenas reproduz o texto digitado.
O campo de resposta começa vazio e preserva espaços e quebras de linha.


## Login com Supabase

1. Crie um projeto no Supabase e habilite o provedor **Email** em Authentication.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a URL do projeto e sua chave publicável. Nunca use a chave `service_role` no aplicativo.
3. Em Authentication → URL Configuration, defina a Site URL do aplicativo e permita a URL de confirmação `http://localhost:3000/auth/callback` no desenvolvimento e `https://seu-dominio/auth/callback` em produção.
4. Reinicie o servidor após configurar as variáveis. Configure também essas duas variáveis no serviço de hospedagem antes do build.

A página `/login` permite entrar e criar conta com e-mail e senha. Se a confirmação de e-mail estiver habilitada, a usuária deve abrir o link recebido no mesmo navegador para concluir o fluxo PKCE. A página principal valida a sessão no servidor; o middleware renova os cookies de autenticação. O topo mostra o e-mail da usuária e permite sair.

## Tabela de respostas

A migração `supabase/migrations/20261022000000_create_respostas.sql` cria a tabela `public.respostas` e habilita Row Level Security. Cada usuária autenticada pode consultar e inserir apenas as próprias respostas; não há políticas de atualização ou exclusão.

Para aplicar, abra o **SQL Editor** do seu projeto Supabase e execute o conteúdo da migração. O SQL pode ser executado novamente: preserva a tabela e seus dados e recria apenas as duas políticas descritas. Se a tabela já existir, sua estrutura precisa corresponder às colunas da migração. Se o projeto já usa Supabase CLI e está vinculado ao banco correto, aplique com `supabase db push`. Esta migração cria a estrutura; o botão **Analisar** ainda não salva respostas no banco.
