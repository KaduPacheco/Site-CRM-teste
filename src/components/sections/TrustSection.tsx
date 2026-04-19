import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BriefcaseBusiness, Building2, HeartHandshake, Shield, TimerReset, Waypoints } from "lucide-react";

const segments = [
  {
    icon: Building2,
    title: "Pequenas e medias empresas",
    description: "Estrutura comercial pensada para operacoes que precisam ganhar controle sem adicionar complexidade desnecessaria.",
  },
  {
    icon: BriefcaseBusiness,
    title: "RH, DP e gestores",
    description: "Uma proposta orientada para quem fecha folha, acompanha jornada e precisa agir com base em dados mais confiaveis.",
  },
  {
    icon: Waypoints,
    title: "Equipes presenciais, externas ou hibridas",
    description: "A plataforma foi desenhada para apoiar diferentes rotinas de jornada e centralizar a gestao em um mesmo fluxo.",
  },
];

const trustBlocks = [
  {
    icon: Shield,
    title: "Conformidade operacional",
    description: "Estrutura pensada para apoiar rotinas de controle de jornada conforme regras aplicaveis e processos internos da empresa.",
  },
  {
    icon: TimerReset,
    title: "Rastreabilidade",
    description: "Historico organizado para conferencia, acompanhamento e rotinas auditaveis no dia a dia da operacao.",
  },
  {
    icon: HeartHandshake,
    title: "Implantacao assistida e suporte humano",
    description: "Apoio proximo na implantacao para reduzir atrito no inicio do uso e acelerar a adaptacao da equipe.",
  },
];

const TrustSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-background py-24" aria-labelledby="trust-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Por que confiar</span>
          <h2 id="trust-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Confianca construida por clareza operacional, nao por promessas vazias.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A proposta combina processo claro, historico rastreavel e implantacao assistida para apoiar a digitalizacao do controle de jornada com mais seguranca.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {segments.map((segment, index) => (
            <article
              key={segment.title}
              className={`rounded-2xl border border-border bg-card p-8 shadow-sm ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <segment.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{segment.title}</h3>
              <p className="leading-7 text-muted-foreground">{segment.description}</p>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] border border-border bg-section-alt p-8 md:p-12">
          <div className="mb-10 max-w-2xl">
            <h3 className="text-2xl font-bold text-foreground md:text-3xl">Pilares de confianca para uma decisao mais segura</h3>
            <p className="mt-3 text-muted-foreground">
              Clareza operacional, historico rastreavel e implantacao assistida ajudam a avaliar a aderencia da plataforma com mais seguranca.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {trustBlocks.map((block, index) => (
              <article
                key={block.title}
                className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.25 + index * 0.12}s` }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                  <block.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-foreground">{block.title}</h4>
                <p className="leading-7 text-muted-foreground">{block.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
