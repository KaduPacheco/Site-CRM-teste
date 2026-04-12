import { supabase } from "@/lib/supabase";
import { CrmLead, CrmLeadEvent, CrmLeadTask } from "@/types/crm";
import {
  DashboardActivityItem,
  DashboardAttentionData,
  DashboardAnalyticsSeriesDatum,
  DashboardChartDatum,
  DashboardKpi,
  DashboardRecentLeadItem,
  DashboardTrafficComparisonDatum,
  DashboardUpcomingTaskItem,
} from "@/types/dashboard";

type DashboardLeadRecord = Pick<
  CrmLead,
  | "id"
  | "nome"
  | "empresa"
  | "origem"
  | "status"
  | "pipeline_stage"
  | "owner_id"
  | "whatsapp"
  | "email"
  | "created_at"
  | "updated_at"
>;

type DashboardTaskRecord = Pick<
  CrmLeadTask,
  "id" | "lead_id" | "assignee_id" | "title" | "due_date" | "completed" | "created_at" | "updated_at"
>;

type DashboardEventRecord = Pick<CrmLeadEvent, "id" | "lead_id" | "event_type" | "payload" | "created_at">;
type DashboardAnalyticsEventRecord = {
  id: string;
  event_type: string;
  visitor_id: string;
  session_id: string;
  occurred_at: string;
  page_path: string;
  page_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  metadata: Record<string, unknown>;
};

const PIPELINE_COLORS: Record<string, string> = {
  novo: "#2563eb",
  em_contato: "#f59e0b",
  qualificado: "#0f766e",
  ganho: "#16a34a",
  perdido: "#dc2626",
  sem_estagio: "#94a3b8",
};

const SOURCE_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#dc2626", "#0891b2", "#64748b"];
const ANALYTICS_FUNNEL_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#7c3aed", "#16a34a"];
const ANALYTICS_FETCH_PAGE_SIZE = 1000;
const ANALYTICS_FETCH_MAX_RECORDS = 5000;

const PIPELINE_ORDER = ["novo", "em_contato", "qualificado", "ganho", "perdido", "sem_estagio"];
const ANALYTICS_FUNNEL_ORDER = [
  "page_view",
  "cta_click",
  "lead_form_start",
  "lead_form_submit_attempt",
  "lead_form_submit_success",
] as const;

export async function getDashboardLeadsDataset(): Promise<DashboardLeadRecord[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id,nome,empresa,origem,status,pipeline_stage,owner_id,whatsapp,email,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao carregar leads do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardLeadRecord[];
}

export async function getDashboardTasksDataset(): Promise<DashboardTaskRecord[]> {
  const { data, error } = await supabase
    .from("lead_tasks")
    .select("id,lead_id,assignee_id,title,due_date,completed,created_at,updated_at")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar tarefas do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardTaskRecord[];
}

export async function getDashboardEventsDataset(limit = 10): Promise<DashboardEventRecord[]> {
  const { data, error } = await supabase
    .from("lead_events")
    .select("id,lead_id,event_type,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Falha ao carregar atividades do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardEventRecord[];
}

export async function getDashboardAnalyticsDataset(
  days = 30,
  maxRecords = ANALYTICS_FETCH_MAX_RECORDS,
): Promise<DashboardAnalyticsEventRecord[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records: DashboardAnalyticsEventRecord[] = [];
  let pageIndex = 0;

  while (records.length < maxRecords) {
    const from = pageIndex * ANALYTICS_FETCH_PAGE_SIZE;
    const to = Math.min(from + ANALYTICS_FETCH_PAGE_SIZE - 1, maxRecords - 1);

    const { data, error } = await supabase
      .from("analytics_events")
      .select(
        "id,event_type,visitor_id,session_id,occurred_at,page_path,page_url,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,metadata",
      )
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Falha ao carregar analytics do dashboard: ${error.message}`);
    }

    const page = (data ?? []) as DashboardAnalyticsEventRecord[];
    records.push(...page);

    if (page.length < ANALYTICS_FETCH_PAGE_SIZE) {
      break;
    }

    pageIndex += 1;
  }

  return records;
}

export function buildLeadKpis(leads: DashboardLeadRecord[]): DashboardKpi[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newLeads = leads.filter((lead) => new Date(lead.created_at).getTime() >= sevenDaysAgo.getTime()).length;

  return [
    {
      id: "total_leads",
      label: "Total de leads",
      value: leads.length,
      description: "Base total visivel pela sua sessao autenticada.",
      helperText: "Volume consolidado do funil atual.",
      tone: "neutral",
    },
    {
      id: "new_leads",
      label: "Novos em 7 dias",
      value: newLeads,
      description: "Entradas recentes vindas da operacao comercial.",
      helperText: "Janela movel dos ultimos 7 dias.",
      tone: newLeads > 0 ? "positive" : "neutral",
    },
  ];
}

export function buildTaskKpis(tasks: DashboardTaskRecord[]): DashboardKpi[] {
  const now = Date.now();
  const openTasks = tasks.filter((task) => !task.completed).length;
  const overdueTasks = tasks.filter(
    (task) => !task.completed && new Date(task.due_date).getTime() < now,
  ).length;

  return [
    {
      id: "open_tasks",
      label: "Tarefas abertas",
      value: openTasks,
      description: "Follow-ups ainda pendentes de execucao.",
      helperText: "Inclui toda a agenda em aberto.",
      tone: openTasks > 0 ? "warning" : "neutral",
    },
    {
      id: "overdue_tasks",
      label: "Tarefas atrasadas",
      value: overdueTasks,
      description: "Itens vencidos que precisam de atencao imediata.",
      helperText: overdueTasks > 0 ? "Prioridade operacional alta." : "Agenda dentro do prazo.",
      tone: overdueTasks > 0 ? "danger" : "positive",
    },
  ];
}

export function buildAnalyticsKpis(events: DashboardAnalyticsEventRecord[]): DashboardKpi[] {
  const pageViewVisitors = getUniqueVisitorCountByEvent(events, "page_view");
  const ctaClicks = events.filter((event) => event.event_type === "cta_click").length;
  const submitSuccess = events.filter((event) => event.event_type === "lead_form_submit_success").length;
  const submitErrors = events.filter((event) => event.event_type === "lead_form_submit_error").length;
  const conversionRate =
    pageViewVisitors > 0 ? Number(((submitSuccess / pageViewVisitors) * 100).toFixed(1)) : 0;

  return [
    {
      id: "landing_visitors",
      label: "Visitors unicos",
      value: pageViewVisitors,
      description: "Visitors unicos que realmente geraram page_view na landing no periodo analisado.",
      helperText: "Base de page_view autenticada.",
      tone: pageViewVisitors > 0 ? "positive" : "neutral",
    },
    {
      id: "landing_cta_clicks",
      label: "Cliques em CTA",
      value: ctaClicks,
      description: "Interacoes registradas nos principais gatilhos comerciais da landing.",
      helperText: "Eventos cta_click.",
      tone: ctaClicks > 0 ? "positive" : "neutral",
    },
    {
      id: "landing_submit_success",
      label: "Conversoes",
      value: submitSuccess,
      description: "Envios concluidos com sucesso pelo formulario da landing.",
      helperText: submitErrors > 0 ? `${submitErrors} erros capturados no periodo.` : "Sem erros de submit no periodo.",
      tone: submitSuccess > 0 ? "positive" : submitErrors > 0 ? "warning" : "neutral",
    },
    {
      id: "landing_conversion_rate",
      label: "Taxa de conversao",
      value: conversionRate,
      description: "Conversoes reais sobre visitors unicos que chegaram a pagina.",
      helperText: "lead_form_submit_success / visitors com page_view.",
      tone: conversionRate > 0 ? "positive" : "neutral",
    },
  ];
}

export function buildPipelineDistribution(leads: DashboardLeadRecord[]): DashboardChartDatum[] {
  const counts = new Map<string, number>();

  leads.forEach((lead) => {
    const stageKey = getLeadStageKey(lead);
    counts.set(stageKey, (counts.get(stageKey) ?? 0) + 1);
  });

  const total = leads.length || 1;

  return Array.from(counts.entries())
    .sort((a, b) => sortPipelineEntries(a[0], b[0]))
    .map(([stageKey, value]) => ({
      id: stageKey,
      label: getStageLabelFromKey(stageKey),
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
      color: PIPELINE_COLORS[stageKey] ?? PIPELINE_COLORS.sem_estagio,
    }));
}

export function buildSourceDistribution(leads: DashboardLeadRecord[]): DashboardChartDatum[] {
  const counts = new Map<string, number>();

  leads.forEach((lead) => {
    const source = getSourceLabel(lead.origem);
    counts.set(source, (counts.get(source) ?? 0) + 1);
  });

  const ordered = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const topSources = ordered.slice(0, 6);
  const remaining = ordered.slice(6);

  if (remaining.length > 0) {
    const othersTotal = remaining.reduce((sum, [, value]) => sum + value, 0);
    topSources.push(["Outros", othersTotal]);
  }

  const total = leads.length || 1;

  return topSources.map(([label, value], index) => ({
    id: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    value,
    percentage: Number(((value / total) * 100).toFixed(1)),
    color: SOURCE_COLORS[index % SOURCE_COLORS.length],
  }));
}

export function buildAnalyticsFunnel(events: DashboardAnalyticsEventRecord[]): DashboardChartDatum[] {
  const uniqueVisitorsByStep = new Map<string, Set<string>>();

  ANALYTICS_FUNNEL_ORDER.forEach((eventType) => {
    uniqueVisitorsByStep.set(eventType, new Set());
  });

  events.forEach((event) => {
    const bucket = uniqueVisitorsByStep.get(event.event_type);

    if (!bucket || !event.visitor_id) {
      return;
    }

    bucket.add(event.visitor_id);
  });

  const base = uniqueVisitorsByStep.get("page_view")?.size || 0;

  return ANALYTICS_FUNNEL_ORDER.map((eventType, index) => {
    const value = uniqueVisitorsByStep.get(eventType)?.size ?? 0;
    const percentage = base > 0 ? Number(((value / base) * 100).toFixed(1)) : 0;

    return {
      id: eventType,
      label: getAnalyticsEventLabel(eventType),
      value,
      percentage,
      color: ANALYTICS_FUNNEL_COLORS[index % ANALYTICS_FUNNEL_COLORS.length],
    };
  });
}

export function buildAnalyticsSourceDistribution(events: DashboardAnalyticsEventRecord[]): DashboardChartDatum[] {
  const counts = new Map<string, Set<string>>();

  events
    .filter((event) => event.event_type === "page_view")
    .forEach((event) => {
      const source = getAnalyticsSourceLabel(event);
      const visitors = counts.get(source) ?? new Set<string>();
      if (event.visitor_id) {
        visitors.add(event.visitor_id);
      }
      counts.set(source, visitors);
    });

  const ordered = Array.from(counts.entries())
    .map(([label, visitors]) => [label, visitors.size] as const)
    .sort((a, b) => b[1] - a[1]);
  const total = ordered.reduce((sum, [, value]) => sum + value, 0) || 1;

  return ordered.slice(0, 6).map(([label, value], index) => ({
    id: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    value,
    percentage: Number(((value / total) * 100).toFixed(1)),
    color: SOURCE_COLORS[index % SOURCE_COLORS.length],
  }));
}

export function buildAnalyticsSeries(
  events: DashboardAnalyticsEventRecord[],
  days = 14,
): DashboardAnalyticsSeriesDatum[] {
  const buckets = createAnalyticsSeriesBuckets(days);

  events.forEach((event) => {
    const key = getDateKey(event.occurred_at);
    const bucket = buckets.get(key);

    if (!bucket) {
      return;
    }

    if (event.event_type === "page_view") {
      if (event.visitor_id) {
        bucket.visitorIds.add(event.visitor_id);
      }
      bucket.pageViews += 1;
      return;
    }

    if (event.event_type === "cta_click") {
      bucket.ctaClicks += 1;
      return;
    }

    if (event.event_type === "lead_form_submit_success") {
      bucket.leads += 1;
    }
  });

  return Array.from(buckets.values()).map((bucket) => {
    const visitors = bucket.visitorIds.size;

    return {
      id: bucket.key,
      label: bucket.label,
      periodStart: bucket.key,
      visitors,
      pageViews: bucket.pageViews,
      ctaClicks: bucket.ctaClicks,
      leads: bucket.leads,
      conversionRate: visitors > 0 ? Number(((bucket.leads / visitors) * 100).toFixed(1)) : 0,
    };
  });
}

export function buildTrafficVsLeadsComparison(
  events: DashboardAnalyticsEventRecord[],
): DashboardTrafficComparisonDatum[] {
  const channels = new Map<
    string,
    {
      visitors: Set<string>;
      leads: number;
    }
  >();

  events.forEach((event) => {
    const isTrafficEvent = event.event_type === "page_view";
    const isLeadEvent = event.event_type === "lead_form_submit_success";

    if (!isTrafficEvent && !isLeadEvent) {
      return;
    }

    const source = getAnalyticsSourceLabel(event);
    const channel = channels.get(source) ?? { visitors: new Set<string>(), leads: 0 };

    if (isTrafficEvent && event.visitor_id) {
      channel.visitors.add(event.visitor_id);
    }

    if (isLeadEvent) {
      channel.leads += 1;
    }

    channels.set(source, channel);
  });

  const totals = Array.from(channels.values()).reduce(
    (accumulator, channel) => {
      return {
        visitors: accumulator.visitors + channel.visitors.size,
        leads: accumulator.leads + channel.leads,
      };
    },
    { visitors: 0, leads: 0 },
  );

  return Array.from(channels.entries())
    .map(([label, channel], index) => {
      const visitors = channel.visitors.size;
      const leads = channel.leads;

      return {
        id: label.toLowerCase().replace(/\s+/g, "_"),
        label,
        visitors,
        leads,
        conversionRate: visitors > 0 ? Number(((leads / visitors) * 100).toFixed(1)) : 0,
        visitorsShare:
          totals.visitors > 0 ? Number(((visitors / totals.visitors) * 100).toFixed(1)) : 0,
        leadsShare: totals.leads > 0 ? Number(((leads / totals.leads) * 100).toFixed(1)) : 0,
        color: SOURCE_COLORS[index % SOURCE_COLORS.length],
      };
    })
    .sort((a, b) => {
      if (b.visitors !== a.visitors) {
        return b.visitors - a.visitors;
      }

      return b.leads - a.leads;
    })
    .slice(0, 6);
}

export function buildRecentLeads(leads: DashboardLeadRecord[], limit = 6): DashboardRecentLeadItem[] {
  return leads.slice(0, limit).map((lead) => ({
    id: lead.id,
    name: lead.nome || "Lead sem nome",
    company: lead.empresa,
    source: getSourceLabel(lead.origem),
    stageLabel: getLeadStageLabel(lead),
    whatsapp: lead.whatsapp,
    email: lead.email,
    createdAt: lead.created_at,
  }));
}

export function buildUpcomingTasks(
  tasks: DashboardTaskRecord[],
  leads: DashboardLeadRecord[] = [],
  limit = 6,
): DashboardUpcomingTaskItem[] {
  const leadMap = createLeadMap(leads);

  return tasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, limit)
    .map((task) => {
      const lead = leadMap.get(task.lead_id);

      return {
        id: task.id,
        leadId: task.lead_id,
        leadName: lead?.nome || "Lead sem identificacao",
        company: lead?.empresa ?? null,
        title: task.title,
        dueDate: task.due_date,
        overdue: isTaskOverdue(task),
        stageLabel: lead ? getLeadStageLabel(lead) : "Sem estagio",
      };
    });
}

export function buildActivityFeed(
  events: DashboardEventRecord[],
  leads: DashboardLeadRecord[] = [],
): DashboardActivityItem[] {
  const leadMap = createLeadMap(leads);

  return events.map((event) => {
    const lead = leadMap.get(event.lead_id);

    return {
      id: event.id,
      leadId: event.lead_id,
      leadName: lead?.nome || "Lead sem identificacao",
      company: lead?.empresa ?? null,
      eventType: event.event_type,
      title: getEventTitle(event.event_type),
      description: getEventDescription(event),
      occurredAt: event.created_at,
    };
  });
}

export function buildAttentionPanel(
  leads: DashboardLeadRecord[],
  tasks: DashboardTaskRecord[],
): DashboardAttentionData {
  const withoutOwner = leads.filter((lead) => !lead.owner_id).length;
  const withoutStage = leads.filter((lead) => getLeadStageKey(lead) === "sem_estagio").length;
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task));

  return {
    metrics: [
      {
        id: "without_owner",
        label: "Leads sem owner",
        count: withoutOwner,
        description: "Registros aguardando responsavel comercial.",
        tone: withoutOwner > 0 ? "warning" : "positive",
      },
      {
        id: "without_stage",
        label: "Leads sem estagio",
        count: withoutStage,
        description: "Itens que ainda nao entraram claramente no funil.",
        tone: withoutStage > 0 ? "warning" : "positive",
      },
      {
        id: "overdue_tasks",
        label: "Tarefas vencidas",
        count: overdueTasks.length,
        description: "Acoes pendentes que ja passaram do prazo.",
        tone: overdueTasks.length > 0 ? "danger" : "positive",
      },
    ],
    overdueTasksPreview: buildUpcomingTasks(overdueTasks, leads, 4),
  };
}

function createLeadMap(leads: DashboardLeadRecord[]) {
  return new Map(leads.map((lead) => [lead.id, lead]));
}

function isTaskOverdue(task: DashboardTaskRecord) {
  return !task.completed && new Date(task.due_date).getTime() < Date.now();
}

function getLeadStageKey(lead: Pick<DashboardLeadRecord, "pipeline_stage" | "status">) {
  const rawValue = (lead.pipeline_stage || lead.status || "").trim().toLowerCase();
  return rawValue || "sem_estagio";
}

function getLeadStageLabel(lead: Pick<DashboardLeadRecord, "pipeline_stage" | "status">) {
  return getStageLabelFromKey(getLeadStageKey(lead));
}

function getStageLabelFromKey(stageKey: string) {
  switch (stageKey) {
    case "novo":
      return "Novo";
    case "em_contato":
      return "Em contato";
    case "qualificado":
      return "Qualificado";
    case "ganho":
      return "Ganho";
    case "perdido":
      return "Perdido";
    default:
      return stageKey === "sem_estagio" ? "Sem estagio" : toTitleCase(stageKey);
  }
}

function getSourceLabel(source: string | null | undefined) {
  const normalized = (source || "").trim();
  return normalized || "Nao informado";
}

function getEventTitle(eventType: string) {
  switch (eventType) {
    case "lead_created":
      return "Lead capturado";
    case "note_added":
      return "Nota registrada";
    case "task_added":
      return "Follow-up agendado";
    case "task_completed":
      return "Tarefa concluida";
    case "task_reopened":
      return "Tarefa reaberta";
    case "status_change":
      return "Status atualizado";
    case "pipeline_change":
      return "Estagio atualizado";
    case "owner_changed":
      return "Ownership ajustado";
    default:
      return toTitleCase(eventType);
  }
}

function getEventDescription(event: DashboardEventRecord) {
  const taskTitle = getPayloadString(event.payload, "title");
  const contentPreview = getPayloadString(event.payload, "content_preview");
  const nextStatus = getPayloadString(event.payload, "to");
  const previousStage = getPayloadString(event.payload, "previous_stage");
  const nextStage = getPayloadString(event.payload, "next_stage");
  const previousOwnerLabel = getPayloadString(event.payload, "previous_owner_label");
  const nextOwnerLabel = getPayloadString(event.payload, "next_owner_label");
  const nextOwnerId = getPayloadString(event.payload, "next_owner_id");

  switch (event.event_type) {
    case "lead_created":
      return "Novo lead entrou no CRM e ja esta disponivel para acompanhamento.";
    case "note_added":
      return contentPreview ? `Resumo da nota: ${contentPreview}` : "Uma anotacao interna foi adicionada ao lead.";
    case "task_added":
      return taskTitle ? `Nova tarefa criada: ${taskTitle}` : "Uma nova tarefa foi criada para este lead.";
    case "task_completed":
      return taskTitle ? `Tarefa concluida: ${taskTitle}` : "Uma tarefa foi concluida.";
    case "task_reopened":
      return taskTitle ? `Tarefa reaberta: ${taskTitle}` : "Uma tarefa voltou para a fila de execucao.";
    case "status_change":
      return nextStatus ? `Novo estado registrado: ${toTitleCase(nextStatus)}` : "Houve atualizacao no status comercial.";
    case "pipeline_change":
      if (previousStage && nextStage) {
        return `${toTitleCase(previousStage)} -> ${toTitleCase(nextStage)}`;
      }

      if (nextStage) {
        return `Lead classificado em ${toTitleCase(nextStage)}.`;
      }

      return "Houve atualizacao no pipeline comercial.";
    case "owner_changed":
      if (previousOwnerLabel && nextOwnerLabel) {
        return `${previousOwnerLabel} -> ${nextOwnerLabel}`;
      }

      if (nextOwnerLabel) {
        return `Lead atribuido para ${nextOwnerLabel}.`;
      }

      if (nextOwnerId) {
        return `Lead atribuido para responsavel ${nextOwnerId.slice(0, 8)}.`;
      }

      return "Ownership atualizado para fila sem responsavel.";
    default:
      return "Atividade registrada automaticamente pelo CRM.";
  }
}

function getPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getUniqueVisitorCountByEvent(events: DashboardAnalyticsEventRecord[], eventType: string) {
  return new Set(
    events
      .filter((event) => event.event_type === eventType)
      .map((event) => event.visitor_id)
      .filter(Boolean),
  ).size;
}

function getAnalyticsEventLabel(eventType: (typeof ANALYTICS_FUNNEL_ORDER)[number]) {
  switch (eventType) {
    case "page_view":
      return "Page view";
    case "cta_click":
      return "CTA click";
    case "lead_form_start":
      return "Inicio do formulario";
    case "lead_form_submit_attempt":
      return "Tentativa de envio";
    case "lead_form_submit_success":
      return "Envio com sucesso";
    default:
      return toTitleCase(eventType);
  }
}

function createAnalyticsSeriesBuckets(days: number) {
  const normalizedDays = Math.max(days, 1);
  const buckets = new Map<
    string,
    {
      key: string;
      label: string;
      visitorIds: Set<string>;
      pageViews: number;
      ctaClicks: number;
      leads: number;
    }
  >();

  for (let offset = normalizedDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    const key = getDateKey(date.toISOString());

    buckets.set(key, {
      key,
      label: formatSeriesLabel(key),
      visitorIds: new Set<string>(),
      pageViews: 0,
      ctaClicks: 0,
      leads: 0,
    });
  }

  return buckets;
}

function getAnalyticsSourceLabel(event: DashboardAnalyticsEventRecord) {
  const utmSource = (event.utm_source || "").trim();

  if (utmSource) {
    return `UTM: ${utmSource}`;
  }

  const referrer = (event.referrer || "").trim();

  if (!referrer) {
    return "Direto";
  }

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function sortPipelineEntries(a: string, b: string) {
  const aIndex = PIPELINE_ORDER.indexOf(a);
  const bIndex = PIPELINE_ORDER.indexOf(b);

  if (aIndex === -1 && bIndex === -1) {
    return a.localeCompare(b);
  }

  if (aIndex === -1) {
    return 1;
  }

  if (bIndex === -1) {
    return -1;
  }

  return aIndex - bIndex;
}

function getDateKey(value: string) {
  return value.slice(0, 10);
}

function formatSeriesLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");

  return `${day}/${month}`;
}

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
