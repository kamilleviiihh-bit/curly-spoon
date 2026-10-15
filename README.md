# Curly Spoon — Analisador de Texto

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

