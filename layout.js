import "./globals.css";

export const metadata = {
  title: "Curly Spoon!",
  description: "Um projeto simples de análise de texto.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

