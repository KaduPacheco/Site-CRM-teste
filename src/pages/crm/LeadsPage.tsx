import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCrmLeads } from "@/services/crmService";

const LeadsPage = () => {
  const { data: leads, isLoading, isError, error } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: getCrmLeads
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Leads</h1>
        <div className="text-sm font-medium opacity-70">
          Últimos cadastros
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm font-medium animate-pulse">Sincronizando base de leads...</p>
          </div>
        )}
        
        {isError && (
          <div className="p-12 text-center text-destructive flex flex-col items-center gap-2">
            <div className="p-3 bg-destructive/10 rounded-full">
              <span className="text-xl font-bold">!</span>
            </div>
            <p className="font-semibold text-sm">Falha na conexão com o banco de dados.</p>
            <p className="text-xs opacity-70">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !isError && leads && leads.length === 0 && (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
               <span className="text-2xl mt-1">📭</span>
            </div>
            <div>
              <p className="font-bold text-lg">Sem leads no momento</p>
              <p className="text-sm opacity-60">Aguardando novas capturas da Landing Page.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && leads && leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-foreground/70 border-b border-border uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Contato / Empresa</th>
                  <th className="px-6 py-4">Status / Origem</th>
                  <th className="px-6 py-4">Data de Entrada</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{lead.nome || "Não informado"}</div>
                      <div className="text-xs opacity-50 flex flex-col">
                        <span>{lead.email}</span>
                        <span className="italic">{lead.empresa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">
                        <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-1 rounded-md border ${
                          (lead.pipeline_stage || lead.status) === 'ganho' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          (lead.pipeline_stage || lead.status) === 'perdido' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {lead.pipeline_stage || lead.status || "NOVO"}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-40 font-bold uppercase tracking-tight">{lead.whatsapp} • {lead.origem}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="text-[10px] opacity-40 font-bold">{new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/crm/leads/${lead.id}`} 
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95"
                      >
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
