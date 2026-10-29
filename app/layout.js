import "./globals.css";
import localFont from "next/font/local";

// Montserrat from the official Google Fonts repository, served locally.
const montserrat = localFont({
  src: "./fonts/montserrat-latin.ttf",
  variable: "--fonte-titulos",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: "Crie seu 1° curriculo!",
  description: "Um projeto simples de análise de texto.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={montserrat.variable}>{children}</body>
    </html>
  );
}
