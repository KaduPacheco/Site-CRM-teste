import { CrmLead, CrmLeadTaskOverview, PipelineStage } from "@/types/crm";

export const PIPELINE_STAGE_ORDER: PipelineStage[] = [
  "novo",
  "em_contato",
  "qualificado",
  "ganho",
  "perdido",
];

export const PIPELINE_STAGE_OPTIONS: Array<{
  value: PipelineStage;
  label: string;
  description: string;
}> = [
  { value: "novo", label: "Novo", description: "Lead recem-capturado aguardando primeiro contato." },
  { value: "em_contato", label: "Em contato", description: "Lead em abordagem ou follow-up ativo." },
  { value: "qualificado", label: "Qualificado", description: "Lead com fit validado e proxima etapa comercial definida." },
  { value: "ganho", label: "Ganho", description: "Oportunidade convertida em negocio." },
  { value: "perdido", label: "Perdido", description: "Lead encerrado sem avancar no funil." },
];

export type LeadStageFilter = "all" | PipelineStage | "without_stage";
export type LeadResponsibilityFilter = "all" | "mine" | "assigned" | "unassigned";
export type LeadsViewMode = "list" | "kanban";

export interface LeadTaskStatusSummary {
  openCount: number;
  overdueCount: number;
  nextTask: CrmLeadTaskOverview | null;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  ganho: "Ganho",
  perdido: "Perdido",
};

const STAGE_BADGE_STYLES: Record<PipelineStage | "without_stage", string> = {
  novo: "border-primary/20 bg-primary/10 text-primary",
  em_contato: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  qualificado: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ganho: "border-secondary/20 bg-secondary/10 text-secondary",
  perdido: "border-destructive/20 bg-destructive/10 text-destructive",
  without_stage: "border-border bg-muted text-muted-foreground",
};

export function getLeadStageValue(lead: Pick<CrmLead, "pipeline_stage" | "status">): PipelineStage | "without_stage" {
  const rawValue = (lead.pipeline_stage || lead.status || "").trim().toLowerCase();

  if (rawValue === "novo" || rawValue === "em_contato" || rawValue === "qualificado" || rawValue === "ganho" || rawValue === "perdido") {
    return rawValue;
  }

  return "without_stage";
}

export function getLeadStageLabel(lead: Pick<CrmLead, "pipeline_stage" | "status">) {
  const stage = getLeadStageValue(lead);
  return stage === "without_stage" ? "Sem etapa" : STAGE_LABELS[stage];
}

export function getLeadStageBadgeClassName(lead: Pick<CrmLead, "pipeline_stage" | "status">) {
  return STAGE_BADGE_STYLES[getLeadStageValue(lead)];
}

export function getLeadStageOptionLabel(stage: PipelineStage) {
  return STAGE_LABELS[stage];
}

export function getOwnerDisplayLabel(ownerId: string | null, currentUserId?: string) {
  if (!ownerId) {
    return "Sem responsavel";
  }

  if (currentUserId && ownerId === currentUserId) {
    return "Voce";
  }

  return `Responsavel ${ownerId.slice(0, 8)}`;
}

export function buildLeadTaskSummary(tasks: CrmLeadTaskOverview[]): LeadTaskStatusSummary {
  const openTasks = tasks.filter((task) => !task.completed);
  const now = Date.now();
  const overdueCount = openTasks.filter((task) => new Date(task.due_date).getTime() < now).length;
  const nextTask =
    [...openTasks].sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())[0] ?? null;

  return {
    openCount: openTasks.length,
    overdueCount,
    nextTask,
  };
}

export function formatTaskDueDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}
