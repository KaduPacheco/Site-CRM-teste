import { ArrowRight, CheckCircle2, PhoneCall, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackCtaClick } from "@/services/analyticsService";

const SuccessView = () => {
  return (
    <div className="animate-fade-in-up">
      <section className="bg-hero-gradient py-24 text-center text-primary-foreground">
        <div className="container mx-auto max-w-3xl">
          <CheckCircle2 className="mx-auto mb-8 h-20 w-20 text-secondary" />
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            Solicitacao enviada com sucesso.
          </h1>
          <p className="mb-10 text-lg font-medium leading-relaxed opacity-90 md:text-xl">
            Entendemos que seu tempo e valioso. Um de nossos especialistas em gestao de RH entrara em contato em ate 24 horas uteis
            para alinhar as necessidades da sua operacao e preparar uma demonstracao personalizada.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="cta" className="h-14 w-full rounded-xl px-8 text-lg shadow-xl sm:w-auto" asChild>
              <a
                href="/"
                onClick={() => {
                  void trackCtaClick({
                    cta_id: "success_view_cta_explorar_funcionalidades",
                    cta_label: "Explorar funcionalidades",
                    placement: "success_view",
                    target: "/",
                  });
                }}
              >
                Explorar funcionalidades
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-xl border-primary-foreground/30 bg-transparent px-8 text-lg text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              asChild
            >
              <a
                href="/"
                onClick={() => {
                  void trackCtaClick({
                    cta_id: "success_view_cta_voltar_inicio",
                    cta_label: "Voltar a pagina inicial",
                    placement: "success_view",
                    target: "/",
                  });
                }}
              >
                Voltar a pagina inicial
              </a>
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-70">Fique de olho no seu e-mail e WhatsApp.</p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
              O que esperar da nossa parceria
            </h2>
            <p className="text-xl text-muted-foreground">
              Conheca os pilares que garantem uma transicao estruturada e risco zero para o seu Departamento Pessoal.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Diagnostico Especializado</h3>
              <p className="leading-relaxed text-muted-foreground">
                Nossa primeira etapa e mapear a fundo as regras de negocio, acordos e exigencias sindicais exclusivas da sua operacao.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Setup Estruturado</h3>
              <p className="leading-relaxed text-muted-foreground">
                Configuramos o novo ambiente do zero com as regras da sua operacao. Preparamos a plataforma para que voce inicie o
                proximo fechamento de folha com total seguranca.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PhoneCall className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Treinamento Lado a Lado</h3>
              <p className="leading-relaxed text-muted-foreground">
                Sua equipe nao opera o software sozinha. Oferecemos capacitacao guiada para que seu time assuma o controle da tecnologia
                desde o dia 1.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessView;
