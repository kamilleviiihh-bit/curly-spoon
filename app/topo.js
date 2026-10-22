import Link from "next/link";
import Sair from "./sair";

export default function Topo({ email, historico = false }) {
  return (
    <header className="topo">
      <span className="email-usuario">{email}</span>
      <nav className="acoes-topo" aria-label="Navegação da conta">
        <Link href="/historico" aria-current={historico ? "page" : undefined}>Meu histórico</Link>
        <Sair />
      </nav>
    </header>
  );
}
