import { Button } from "@/components/ui/Button";
import { trackCtaClick } from "@/services/analyticsService";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Se a folha fecha no sufoco, vale entender como essa rotina pode ficar mais leve.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/82 md:text-xl">
            O proximo passo e simples: entender o seu cenario, apresentar a plataforma e avaliar se faz sentido avancar para um teste gratis de 14 dias.
          </p>

          <div className="mt-10 flex justify-center">
            <Button size="lg" variant="hero" className="h-14 rounded-xl px-10 text-lg font-bold shadow-xl" asChild>
              <a
                href="#contato"
                onClick={() => {
                  void trackCtaClick({
                    cta_id: "final_cta_solicitar_demonstracao",
                    cta_label: "Solicitar demonstracao final",
                    placement: "final_cta",
                    target: "#contato",
                  });
                }}
              >
                Solicitar demonstracao
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm font-medium text-primary-foreground/80">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              Demonstracao consultiva
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              Teste gratis de 14 dias
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              Apoio inicial na implantacao
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
