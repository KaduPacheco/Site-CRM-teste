import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GitCompareArrows } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { SectionEmptyState, SectionErrorState } from "./SectionStates";
import { DashboardTrafficComparisonDatum } from "@/types/dashboard";

interface TrafficVsLeadsChartProps {
  data?: DashboardTrafficComparisonDatum[];
  isLoading?: boolean;
  errorMessage?: string;
}

const TrafficVsLeadsChart = ({ data, isLoading, errorMessage }: TrafficVsLeadsChartProps) => {
  return (
    <DashboardSection
      title="Trafego x leads por canal"
      subtitle="Comparativo real entre visitors da landing e leads gerados com sucesso por origem."
    >
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),280px]">
          <div className="h-[280px] animate-pulse rounded-3xl bg-muted/40" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      ) : errorMessage ? (
        <SectionErrorState
          title="Nao foi possivel comparar trafego e leads"
          description={errorMessage}
        />
      ) : !data || data.length === 0 ? (
        <SectionEmptyState
          title="Sem canais suficientes para comparacao"
          description="Assim que houver trafego e conversoes reais por origem, este comparativo sera habilitado."
          icon={<GitCompareArrows className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),280px]">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  style={{ fontSize: "12px", fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="visitors" name="Visitors" radius={[0, 10, 10, 0]} barSize={24}>
                  {data.map((entry) => (
                    <Cell key={`${entry.id}-visitors`} fill={entry.color} fillOpacity={0.95} />
                  ))}
                </Bar>
                <Bar dataKey="leads" name="Leads" radius={[0, 10, 10, 0]} barSize={14}>
                  {data.map((entry) => (
                    <Cell key={`${entry.id}-leads`} fill={entry.color} fillOpacity={0.35} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                    <p className="truncate text-sm font-medium text-foreground">{entry.label}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{entry.conversionRate}% conv.</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <MetricPill label="Visitors" value={entry.visitors} />
                  <MetricPill label="Leads" value={entry.leads} />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {entry.visitorsShare}% do trafego e {entry.leadsShare}% dos leads do periodo.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export default TrafficVsLeadsChart;
