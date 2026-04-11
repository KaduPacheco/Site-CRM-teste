import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, Clock3 } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import { DashboardRecentLeadItem } from "@/types/dashboard";

interface RecentLeadsListProps {
  data?: DashboardRecentLeadItem[];
  isLoading?: boolean;
  errorMessage?: string;
}

const RecentLeadsList = ({ data, isLoading, errorMessage }: RecentLeadsListProps) => {
  return (
    <DashboardSection
      title="Leads recentes"
      subtitle="Ultimas entradas na base para triagem e priorizacao."
      action={
        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Ver base
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {isLoading ? (
        <SectionSkeleton rows={5} />
      ) : errorMessage ? (
        <SectionErrorState
          title="Falha ao carregar leads recentes"
          description={errorMessage}
        />
      ) : !data || data.length === 0 ? (
        <SectionEmptyState
          title="Nenhum lead recente encontrado"
          description="Assim que novos contatos forem capturados pela landing, eles aparecerao aqui."
        />
      ) : (
        <div className="space-y-3">
          {data.map((lead) => (
            <Link
              key={lead.id}
              to={`/crm/leads/${lead.id}`}
              className="block rounded-2xl border border-border/70 bg-muted/15 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{lead.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate">{lead.company || "Empresa nao informada"}</span>
                  </div>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {lead.stageLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{lead.source}</span>
                <span>{lead.whatsapp}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDateTime(lead.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default RecentLeadsList;
