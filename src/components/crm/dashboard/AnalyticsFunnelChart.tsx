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
import { Filter } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { SectionEmptyState, SectionErrorState } from "./SectionStates";
import { DashboardChartDatum } from "@/types/dashboard";

interface AnalyticsFunnelChartProps {
  data?: DashboardChartDatum[];
  isLoading?: boolean;
  errorMessage?: string;
}

const AnalyticsFunnelChart = ({ data, isLoading, errorMessage }: AnalyticsFunnelChartProps) => {
  return (
    <DashboardSection
      title="Funil da landing"
      subtitle="Leitura real de visitors por etapa de aquisicao, da visita ate o envio bem-sucedido."
    >
      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[130px,1fr,56px] items-center gap-3">
              <div className="h-4 animate-pulse rounded-full bg-muted/50" />
              <div className="h-10 animate-pulse rounded-2xl bg-muted/50" />
              <div className="h-4 animate-pulse rounded-full bg-muted/50" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <SectionErrorState
          title="Nao foi possivel montar o funil da landing"
          description={errorMessage}
        />
      ) : !data || data.every((entry) => entry.value === 0) ? (
        <SectionEmptyState
          title="Sem eventos suficientes para o funil"
          description="Assim que a landing registrar page views e interacoes reais, o funil aparecera aqui."
          icon={<Filter className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),280px]">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={130}
                  style={{ fontSize: "12px", fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                  formatter={(value: number, _name: string, item) => {
                    const entry = item?.payload as DashboardChartDatum | undefined;
                    return [`${value} visitors`, `${entry?.percentage ?? 0}% da base`];
                  }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24}>
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">{entry.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{entry.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{entry.percentage}% em relacao aos visitors que viram a pagina.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

export default AnalyticsFunnelChart;
