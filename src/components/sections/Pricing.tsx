import { Check, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/services/analyticsService";

const features = [
  "Registro de ponto digital",
  "Relatorios automaticos",
  "Controle de horas extras",
  "Banco de horas",
  "App mobile",
  "Suporte humanizado",
  "Acesso via celular ou PC",
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="precos" className="bg-section-alt py-20">
      <div className="container" ref={ref}>
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Preco especial</span>
          <h2 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">
            Pode custar menos do que <span className="text-secondary">um unico erro</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Processos trabalhistas podem gerar custos nao previstos. Nosso sistema ajuda a mitigar esses riscos por um preco acessivel.
          </p>
        </div>

        <div className="mx-auto max-w-lg">
          <div
            className={`relative overflow-hidden rounded-2xl bg-hero-gradient text-primary-foreground shadow-2xl ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="absolute right-0 top-0">
              <div className="flex items-center gap-1.5 rounded-bl-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                <Clock className="h-3.5 w-3.5" />
                Condicao especial
              </div>
            </div>

            <div className="p-10 pt-14">
              <div className="mb-1 flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                <h3 className="text-xl font-bold">Plano Completo</h3>
              </div>
              <p className="mb-6 text-sm opacity-80">Tudo que voce precisa para controlar a jornada da sua equipe</p>

              <div className="mb-2">
                <span className="text-5xl font-extrabold">R$59,90</span>
                <span className="text-lg opacity-70">/mes</span>
              </div>
              <p className="mb-2 text-sm opacity-80">Para ate 5 funcionarios</p>
              <p className="mb-8 inline-block rounded-lg bg-primary-foreground/10 px-3 py-1 text-sm font-semibold opacity-90">
                + R$7,00 por funcionario adicional
              </p>

              <ul className="mb-8 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant="hero"
                className="h-14 w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
                asChild
              >
                <a
                  href="#contato"
                  onClick={() => {
                    void trackCtaClick({
                      cta_id: "pricing_cta_aproveitar_condicao",
                      cta_label: "Aproveitar condicao especial",
                      placement: "pricing",
                      target: "#contato",
                    });
                  }}
                >
                  Aproveitar condicao especial
                </a>
              </Button>

              <p className="mt-4 text-center text-xs opacity-70">
                Teste gratis por 14 dias. Planos flexiveis conforme sua necessidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
