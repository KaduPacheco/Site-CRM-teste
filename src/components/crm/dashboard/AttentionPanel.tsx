import { Link } from "react-router-dom";
import { ArrowUpRight, CircleAlert, UserRoundX } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import { DashboardAttentionData } from "@/types/dashboard";

interface AttentionPanelProps {
  data?: DashboardAttentionData;
  isLoading?: boolean;
  errorMessage?: string;
}

const AttentionPanel = ({ data, isLoading, errorMessage }: AttentionPanelProps) => {
  const hasAttentionItems = data?.metrics.some((metric) => metric.count > 0);

  return (
    <DashboardSection
      title="Painel de atencao"
      subtitle="Pontos operacionais que precisam de saneamento no curto prazo."
      action={
        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Revisar leads
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {isLoading ? (
        <SectionSkeleton rows={4} />
      ) : errorMessage ? (
        <SectionErrorState
          title="Falha ao montar o painel de atencao"
          description={errorMessage}
        />
      ) : !data ? (
        <SectionEmptyState
          title="Sem dados de atencao"
          description="Quando o CRM tiver dados suficientes, os alertas operacionais aparecerao aqui."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {data.metrics.map((metric) => (
              <div
                key={metric.id}
                className={`rounded-2xl border p-4 ${
                  metric.tone === "danger"
                    ? "border-destructive/20 bg-destructive/5"
                    : metric.tone === "warning"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-secondary/20 bg-secondary/5"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{metric.count}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>

          {!hasAttentionItems ? (
            <SectionEmptyState
              title="Operacao sob controle"
              description="Nenhum alerta critico foi identificado nos dados visiveis para esta sessao."
              icon={<UserRoundX className="h-5 w-5" />}
              className="min-h-[160px]"
            />
          ) : data.overdueTasksPreview.length > 0 ? (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CircleAlert className="h-4 w-4 text-destructive" />
                Tarefas vencidas com maior urgencia
              </div>
              <div className="space-y-3">
                {data.overdueTasksPreview.map((task) => (
                  <Link
                    key={task.id}
                    to={`/crm/leads/${task.leadId}`}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-destructive/10 bg-background/90 p-3 transition-colors hover:bg-destructive/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {task.leadName}
                        {task.company ? ` • ${task.company}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-destructive">{formatDate(task.dueDate)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </DashboardSection>
  );
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

export default AttentionPanel;
