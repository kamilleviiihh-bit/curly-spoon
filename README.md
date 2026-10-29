# Curly Spoon — Crie seu 1° curriculo!

Projeto Next.js com App Router e JavaScript, preparado para publicar na Vercel.

## Rodar localmente

1. Instale o Node.js 22 ou superior.
2. Abra um terminal na pasta do projeto e execute `npm ci`.
3. Execute `npm run dev`.
4. Abra http://localhost:3000.

## Personalização

- Textos da página: `desafio.js`.
- Título da aba do navegador e descrição: `app/layout.js`.
- Cores e estilos: `app/globals.css` (variáveis no início do arquivo).

## Publicar na Vercel

Importe este repositório na Vercel, selecione Next.js e clique em Deploy. Configure as variáveis de ambiente descritas abaixo antes do build.

Para verificar a compilação de produção, execute `npm run build`.
Para executá-la localmente depois de compilar, execute `npm start`.

O formulário de currículo usa `desafio.js`. Com `modoTeste: true`, retorna um exemplo local sem chamar a IA.
O campo de resposta começa vazio e preserva espaços e quebras de linha.


## Login com Supabase

1. Crie um projeto no Supabase e habilite o provedor **Email** em Authentication.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a URL do projeto e sua chave publicável. Nunca use a chave `service_role` no aplicativo.
3. Em Authentication → URL Configuration, defina a Site URL do aplicativo e permita a URL de confirmação `http://localhost:3000/auth/callback` no desenvolvimento e `https://seu-dominio/auth/callback` em produção.
4. Reinicie o servidor após configurar as variáveis. Configure também essas duas variáveis no serviço de hospedagem antes do build.

A página `/login` permite entrar e criar conta com e-mail e senha. Se a confirmação de e-mail estiver habilitada, a usuária deve abrir o link recebido no mesmo navegador para concluir o fluxo PKCE. A página principal valida a sessão no servidor; o middleware renova os cookies de autenticação. O topo mostra o e-mail da usuária e permite sair.

## Tabela de respostas

A migração `supabase/migrations/20261022000000_create_respostas.sql` cria a tabela `public.respostas` e habilita Row Level Security. Cada usuária autenticada pode consultar e inserir apenas as próprias respostas; não há políticas de atualização ou exclusão.

Para aplicar, abra o **SQL Editor** do seu projeto Supabase e execute o conteúdo da migração. O SQL pode ser executado novamente: preserva a tabela e seus dados e recria apenas as duas políticas descritas. Se a tabela já existir, sua estrutura precisa corresponder às colunas da migração. Se o projeto já usa Supabase CLI e está vinculado ao banco correto, aplique com `supabase db push`. A rota `/api/ia` salva as respostas usando essa tabela e a sessão da usuária.


## Inteligência artificial

`desafio.js` define nome, subtítulo, campos, botão, aviso, modelo, prompt e `modoTeste`. O nome personalizado do site foi mantido. O formulário é montado a partir desse arquivo; o prompt permanece no servidor. A rota autenticada `POST /api/ia` recebe um objeto JSON com os IDs dos campos e retorna texto simples, preservando as quebras de linha. Erros retornam JSON com `erro` em português.

A IA real está ativada com `modoTeste: false`. Configure `OPENROUTER_API_KEY` nas variáveis de ambiente da Vercel (ou `.env.local` no desenvolvimento) e publique novamente após alterar a chave. Para testar sem chamar a IA nem consumir cota, altere `modoTeste` para `true`. Não coloque a chave no código nem em variáveis `NEXT_PUBLIC_`. O servidor acessa `https://openrouter.ai/api/v1/chat/completions` com o modelo do arquivo e `max_tokens: 900`.

A rota exige sessão válida, aceita campos vazios para omitir seções e exige pelo menos uma resposta preenchida. O exemplo de teste não inventa experiências. Após gerar uma resposta, a rota salva a entrada com os rótulos e o texto gerado na tabela `respostas`. Se o banco falhar, o currículo continua visível e a tela avisa que não foi salvo, sem gerar outra resposta automaticamente.

Valide a lógica de IA com `node --test tests/*.test.mjs`. A suíte usa respostas simuladas, sem chamar a OpenRouter nem consumir cota.


## Histórico privado

A página `/historico` exige login e lista somente as respostas da usuária autenticada, da mais recente para a mais antiga, com data e hora de Brasília, campos enviados e resposta. A paginação mostra 20 registros por página. O link **Meu histórico** fica ao lado de **Sair** no topo.

O servidor usa a chave pública com a sessão existente: não usa `service_role` nem aceita `user_id` enviado pelo navegador. A consulta filtra o ID autenticado, e as políticas RLS da migração também protegem as linhas no banco. O ID de quem salva é preenchido por `auth.uid()`. O modo de teste também salva exemplos quando está ligado.

Para conferir no projeto real, entre com a conta A, gere dois currículos e confira o histórico. Em janela anônima, entre com a conta B, gere um currículo e confirme que só ele aparece. Saia e tente acessar `/historico`: deve redirecionar para `/login`.


O prompt de currículo orienta usar somente o conteúdo explicitamente informado em cada campo, sem deduzir habilidades a partir de cursos ou experiências, sem inventar resultados ou métricas e sem exigir uma quantidade mínima de itens. Campos vazios devem ser omitidos; a revisão de ortografia e pontuação não deve ampliar o significado. Respostas já salvas no histórico não são reescritas.


## Recuperação de senha

O link **Esqueci a senha** em `/login` abre `/esqueci-senha`. O Supabase envia um e-mail com link para `/auth/callback?fluxo=recuperacao`; o servidor troca o código PKCE por uma sessão e encaminha para `/redefinir-senha`. A alteração da senha exige uma sessão validada no servidor. A mensagem de envio não revela se o e-mail tem uma conta.

Em Authentication → URL Configuration, mantenha a Site URL do aplicativo e permita o callback de recuperação no mesmo domínio. A regra `https://seu-dominio/**` já abrange esse caminho; no desenvolvimento, permita também `http://localhost:3000/**`. Mantenha o template de recuperação com o link de confirmação padrão do Supabase (`{{ .ConfirmationURL }}`), e configure o envio de e-mails no Supabase conforme as necessidades do projeto.

Abra o link de recuperação no mesmo navegador em que solicitou, pois o fluxo usa PKCE. Links expirados ou já usados exigem nova solicitação. A tela de sucesso mantém a sessão e permite ir ao site. Nenhuma chave adicional ou mudança de tabela é necessária.


## Área de trabalho e modelos de currículo

A página principal organiza o formulário e o resultado lado a lado no computador e em sequência no celular, com atalhos para dados, resultado e modelos. Ao final, os modelos **Clássico**, **Moderno** e **Essencial** podem ser abertos para leitura completa, inclusive pelo teclado.

Os três modelos apresentam exatamente o mesmo texto gerado pela IA, sem acrescentar ou deduzir informações. Antes da geração, exibem apenas campos ilustrativos entre colchetes. A escolha de visualização não faz uma nova chamada à IA, não modifica a resposta nem altera o histórico salvo.


Os modelos têm estruturas distintas: Clássico em coluna única com cabeçalho centralizado; Moderno com cursos e habilidades na barra lateral; Essencial com blocos em duas colunas. As seções são reconhecidas apenas pelos títulos explícitos da resposta, preservando todas as linhas originais. Seções não reconhecidas permanecem no texto, sem inferir ou criar conteúdo. Em telas pequenas, a visualização completa se adapta para uma coluna.
