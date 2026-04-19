import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "Como os funcionarios registram o ponto?",
    answer:
      "O registro pode ser feito pelos canais ja suportados pela plataforma, conforme a rotina definida para a empresa. Na implantacao, ajustamos o fluxo mais adequado para a operacao.",
  },
  {
    question: "Funciona para equipe externa, presencial e home office?",
    answer:
      "Sim. A plataforma foi pensada para acompanhar diferentes rotinas de trabalho com gestao centralizada para RH, DP e liderancas.",
  },
  {
    question: "Como funciona o teste gratis?",
    answer:
      "O teste de 14 dias e usado para validar a aderencia da plataforma a rotina da empresa apos o alinhamento inicial com o time comercial.",
  },
  {
    question: "O sistema ajuda no fechamento da folha?",
    answer:
      "Sim. A plataforma organiza informacoes da jornada para reduzir retrabalho, facilitar conferencias e apoiar o fechamento com mais clareza.",
  },
  {
    question: "Preciso de relogio de ponto fisico?",
    answer:
      "Nao necessariamente. A avaliacao inicial considera a rotina da empresa para definir o fluxo mais adequado dentro do que a plataforma suporta hoje.",
  },
  {
    question: "Como funciona a implantacao?",
    answer:
      "A implantacao comeca com alinhamento do cenario da empresa e apoio inicial para reduzir atrito no comeco do uso.",
  },
];

const FaqSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" className="bg-background py-24" aria-labelledby="faq-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Perguntas frequentes</span>
          <h2 id="faq-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Respostas objetivas para a avaliacao inicial da sua operacao.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Confira os principais pontos sobre uso, implantacao, teste e aderencia da plataforma antes da demonstracao.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {faqs.map((item, index) => (
            <article
              key={item.question}
              className={`rounded-2xl border border-border bg-card p-7 shadow-sm ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <h3 className="text-lg font-bold text-foreground">{item.question}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
