import { Button } from "@/components/ui/Button";
import { Clock } from "lucide-react";
import { trackCtaClick } from "@/services/analyticsService";

interface HeaderProps {
  hideCTA?: boolean;
}

const Header = ({ hideCTA = false }: HeaderProps) => {
  const trackHeaderClick = (ctaId: string, ctaLabel: string, target: string) => {
    void trackCtaClick({
      cta_id: ctaId,
      cta_label: ctaLabel,
      placement: "header",
      target,
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Ponto Eletronico</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#problemas" className="transition-colors hover:text-foreground" onClick={() => trackHeaderClick("header_nav_problemas", "Problemas", "#problemas")}>Problemas</a>
          <a href="#solucao" className="transition-colors hover:text-foreground" onClick={() => trackHeaderClick("header_nav_solucao", "Solucao", "#solucao")}>Solucao</a>
          <a href="#precos" className="transition-colors hover:text-foreground" onClick={() => trackHeaderClick("header_nav_precos", "Precos", "#precos")}>Precos</a>
          <a href="#contato" className="transition-colors hover:text-foreground" onClick={() => trackHeaderClick("header_nav_contato", "Contato", "#contato")}>Contato</a>
        </nav>
        {!hideCTA ? (
          <Button variant="cta" size="sm" asChild>
            <a href="#contato" onClick={() => trackHeaderClick("header_cta_testar_gratis", "Testar Gratis", "#contato")}>Testar Gratis</a>
          </Button>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
