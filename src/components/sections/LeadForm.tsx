import { useRef, useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/useToast";
import { leadSchema } from "@/lib/validations";
import {
  trackLeadFormStart,
  trackLeadFormSubmitAttempt,
  trackLeadFormSubmitError,
  trackLeadFormSubmitSuccess,
} from "@/services/analyticsService";
import { submitLeadToSupabase } from "@/services/leadService";

const FORM_ID = "landing_lead_form";
const SECTION_ID = "contato";

const LeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    empresa: "",
    employees: "",
    bot_field: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(() => Date.now());
  const hasTrackedStartRef = useRef(false);

  const handleFormStart = () => {
    if (hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
    void trackLeadFormStart({
      form_id: FORM_ID,
      section_id: SECTION_ID,
      surface: "landing",
    });
  };

  const getElapsedMs = () => Date.now() - startTime;

  const getFilledFieldsCount = () =>
    [form.name, form.whatsapp, form.email, form.empresa, form.employees].filter((value) => value.trim().length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    void trackLeadFormSubmitAttempt({
      form_id: FORM_ID,
      section_id: SECTION_ID,
      elapsed_ms: getElapsedMs(),
      filled_fields_count: getFilledFieldsCount(),
      has_email: Boolean(form.email.trim()),
      has_company: Boolean(form.empresa.trim()),
      has_whatsapp: Boolean(form.whatsapp.trim()),
      has_employees: Boolean(form.employees.trim()),
    });

    const result = leadSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });

      setErrors(fieldErrors);

      void trackLeadFormSubmitError({
        form_id: FORM_ID,
        section_id: SECTION_ID,
        error_type: "validation",
        error_fields: Object.keys(fieldErrors),
        elapsed_ms: getElapsedMs(),
      });

      return;
    }

    if (form.bot_field || getElapsedMs() < 3000) {
      void trackLeadFormSubmitError({
        form_id: FORM_ID,
        section_id: SECTION_ID,
        error_type: "anti_spam",
        blocked_reason: form.bot_field ? "honeypot" : "fast_submit",
        elapsed_ms: getElapsedMs(),
      });

      toast({ title: "Sua solicitacao foi recebida." });

      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }

      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await submitLeadToSupabase({
        nome: result.data.name,
        whatsapp: result.data.whatsapp,
        email: result.data.email || undefined,
        empresa: result.data.empresa,
        funcionarios: result.data.employees,
      });

      void trackLeadFormSubmitSuccess({
        form_id: FORM_ID,
        section_id: SECTION_ID,
        elapsed_ms: getElapsedMs(),
        source: "landing_page",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Em breve entraremos em contato com voce.",
      });
    } catch (error) {
      void trackLeadFormSubmitError({
        form_id: FORM_ID,
        section_id: SECTION_ID,
        error_type: "transport",
        error_message: error instanceof Error ? error.message : "unknown_error",
        elapsed_ms: getElapsedMs(),
      });

      toast({
        title: "Erro ao enviar",
        description: "Nao foi possivel enviar seus dados, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="contato" className="bg-hero-gradient py-20">
        <div className="container text-center text-primary-foreground">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-secondary" />
          <h2 className="mb-4 text-3xl font-extrabold">Obrigado pelo interesse!</h2>
          <p className="text-lg opacity-90">Nossa equipe entrara em contato em ate 24 horas.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="bg-hero-gradient py-20">
      <div className="container" ref={ref}>
        <div className="mx-auto max-w-lg">
          <div className={`mb-10 text-center text-primary-foreground ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">Fale com um Especialista</h2>
            <p className="mx-auto max-w-sm opacity-90">
              Descubra como nossa plataforma pode eliminar o trabalho bracal do seu RH. Receba 14 dias de teste gratis.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            onFocusCapture={handleFormStart}
            className={`rounded-2xl bg-card p-8 shadow-2xl ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-4">
              <input
                type="text"
                name="bot_field"
                value={form.bot_field}
                onChange={(e) => setForm({ ...form, bot_field: e.target.value })}
                className="absolute -z-10 h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div>
                <label htmlFor="name" className="sr-only">Nome Completo</label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="whatsapp" className="sr-only">WhatsApp</label>
                <Input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp (ex: 11 99999-9999)"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={!!errors.whatsapp}
                  aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                />
                {errors.whatsapp && <p id="whatsapp-error" className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}
              </div>
              <div>
                <label htmlFor="email" className="sr-only">E-mail corporativo</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu melhor e-mail (opcional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={255}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="empresa" className="sr-only">Nome da Empresa</label>
                <Input
                  id="empresa"
                  placeholder="Nome da sua empresa"
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="organization"
                  aria-invalid={!!errors.empresa}
                  aria-describedby={errors.empresa ? "empresa-error" : undefined}
                />
                {errors.empresa && <p id="empresa-error" className="mt-1 text-xs text-destructive">{errors.empresa}</p>}
              </div>
              <div>
                <label htmlFor="employees" className="sr-only">Quantidade de funcionarios</label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="Quantidade exata de funcionarios"
                  value={form.employees}
                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
                  className="h-12 rounded-xl"
                  min="1"
                  autoComplete="off"
                  aria-invalid={!!errors.employees}
                  aria-describedby={errors.employees ? "employees-error" : undefined}
                />
                {errors.employees && <p id="employees-error" className="mt-1 text-xs text-destructive">{errors.employees}</p>}
              </div>
            </div>
            <Button
              variant="cta"
              type="submit"
              className="mt-6 h-14 w-full rounded-xl text-lg"
              disabled={isSubmitting || submitted}
            >
              <Send className={`mr-2 h-5 w-5 ${isSubmitting ? "animate-pulse" : ""}`} />
              {isSubmitting ? "Enviando..." : "Quero testar agora"}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Seus dados serao usados apenas para contato comercial e demonstracao da plataforma. Nao enviamos spam.
              Ao enviar, voce concorda com nossos termos.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
