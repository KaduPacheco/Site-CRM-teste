import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getCrmLeadById, getLeadNotes, createLeadNote, getLeadTasks, createLeadTask, updateTaskStatus, getLeadEvents } from "@/services/crmService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { MessageSquare, Send, Clock, User as UserIcon, Calendar, CheckSquare, Square, AlertCircle, History, Activity, Package } from "lucide-react";

/**
 * Interface auxiliar para mesclar Notas e Eventos
 */
interface TimelineItem {
  id: string;
  type: 'note' | 'event';
  content: string;
  created_at: string;
  icon?: React.ReactNode;
  metadata?: any;
}

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  
  // Estado para nova tarefa
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const { data: lead, isLoading: isLoadingLead, isError: isErrorLead } = useQuery({
    queryKey: ['crm-lead', id],
    queryFn: () => getCrmLeadById(id!),
    enabled: !!id
  });

  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['crm-lead-notes', id],
    queryFn: () => getLeadNotes(id!),
    enabled: !!id
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['crm-lead-events', id],
    queryFn: () => getLeadEvents(id!),
    enabled: !!id
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['crm-lead-tasks', id],
    queryFn: () => getLeadTasks(id!),
    enabled: !!id
  });

  // Mesclagem de Notas e Eventos para a Timeline
  const timelineItems: TimelineItem[] = [
    ...(notes || []).map((n: any) => ({
      id: n.id,
      type: 'note' as const,
      content: n.content,
      created_at: n.created_at,
      icon: <MessageSquare className="w-3.5 h-3.5" />
    })),
    ...(events || []).map((e: any) => ({
      id: e.id,
      type: 'event' as const,
      content: e.event_type === 'note_added' ? 'Nota manual adicionada' : 
               e.event_type === 'task_added' ? `Agendada: ${e.payload.title}` :
               e.event_type === 'task_completed' ? `Concluída: ${e.payload.title}` :
               e.event_type === 'task_reopened' ? `Reaberta: ${e.payload.title}` :
               e.event_type,
      created_at: e.created_at,
      icon: <Activity className="w-3.5 h-3.5" />,
      metadata: e.payload
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const noteMutation = useMutation({
    mutationFn: () => createLeadNote(id!, newNote, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-lead-notes', id] });
      queryClient.invalidateQueries({ queryKey: ['crm-lead-events', id] }); // Atualiza timeline
      setNewNote("");
      toast({ title: "Nota adicionada!" });
    }
  });

  const taskMutation = useMutation({
    mutationFn: (task: { title: string, due_date: string }) => 
      createLeadTask({ lead_id: id!, title: task.title, due_date: task.due_date, assignee_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-lead-tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['crm-lead-events', id] }); // Atualiza timeline
      setTaskTitle("");
      setTaskDate("");
      toast({ title: "Tarefa agendada!" });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string, completed: boolean }) => 
      updateTaskStatus(taskId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-lead-tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['crm-lead-events', id] }); // Atualiza timeline
    }
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    noteMutation.mutate();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate) return;
    taskMutation.mutate({ title: taskTitle, due_date: taskDate });
  };

  const isLoading = isLoadingLead;
  const isError = isErrorLead;

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/crm/leads" className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Dossiê do Lead</h1>
      </div>

      {isLoading && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center text-muted-foreground flex flex-col items-center gap-4 animate-pulse">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Carregando dossiê completo...</p>
        </div>
      )}

      {isError && (
        <div className="bg-card rounded-2xl border border-destructive/20 shadow-sm p-12 text-center text-destructive bg-destructive/5 flex flex-col items-center gap-2">
          <AlertCircle className="w-10 h-10 mb-2" />
          <p className="font-bold">Erro de Sincronização</p>
          <p className="text-sm opacity-70">Não foi possível recuperar os dados deste lead.</p>
        </div>
      )}

      {!isLoading && !isError && lead && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Dados Cadastrais */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center text-foreground">
                <h2 className="font-bold text-lg">Dados do Cliente</h2>
                <div className="flex gap-2">
                  <span className={`uppercase text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-md border ${
                    (lead.pipeline_stage || lead.status) === 'ganho' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                    (lead.pipeline_stage || lead.status) === 'perdido' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {lead.pipeline_stage || lead.status || "NOVO"}
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40">Identificação</label>
                  <div className="font-bold text-xl text-neutral-900 dark:text-neutral-50">{lead.nome}</div>
                  <div className="text-sm font-medium text-primary uppercase tracking-tight">{lead.empresa}</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40">Contato Direto</label>
                  <div className="font-mono text-base font-semibold text-neutral-800 dark:text-neutral-200">{lead.whatsapp}</div>
                  <div className="text-xs opacity-60 underline hover:text-primary transition-colors cursor-pointer">{lead.email || "Sem e-mail cadastrado"}</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40">Informações de Contexto</label>
                  <div className="text-sm">Origem: <span className="font-semibold uppercase">{lead.origem}</span></div>
                  <div className="text-sm">Porte: <span className="font-semibold">{lead.funcionarios || "?"} funcionários</span></div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40">Datas do Sistema</label>
                  <div className="text-sm">Capturado: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
                  <div className="text-sm font-mono opacity-50 text-[10px]">{lead.id}</div>
                </div>
              </div>
            </div>

            {/* Gestão de Tarefas */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
               <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-primary" />
                   <h2 className="font-bold text-lg">Follow-ups e Tarefas</h2>
                 </div>
               </div>
               <div className="p-6 space-y-4">
                 {/* Lista de Tarefas */}
                 <div className="space-y-2">
                   {isLoadingTasks ? (
                     <p className="text-sm text-center opacity-50">Buscando agenda...</p>
                   ) : tasks && tasks.length > 0 ? (
                     tasks.map((task: any) => {
                       const isOverdue = !task.completed && new Date(task.due_date) < new Date();
                       return (
                         <div key={task.id} className={`flex items-center gap-4 p-3 rounded-xl border ${task.completed ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background border-border shadow-sm'}`}>
                            <button 
                              onClick={() => toggleTaskMutation.mutate({ taskId: task.id, completed: !task.completed })}
                              className="text-primary hover:scale-110 transition-transform"
                            >
                              {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                              </div>
                              <div className={`text-[10px] flex items-center gap-1 font-bold ${isOverdue ? 'text-destructive' : 'opacity-50'}`}>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                         </div>
                       );
                     })
                   ) : (
                     <p className="text-sm text-center italic opacity-40 py-4">Sem tarefas agendadas para este lead.</p>
                   )}
                 </div>

                 {/* Formulário de Tarefa */}
                 <form onSubmit={handleAddTask} className="pt-4 border-t border-dashed border-border flex flex-col sm:flex-row gap-2">
                    <Input 
                      placeholder="Nova tarefa (ex: Ligar para...) " 
                      className="flex-1 h-10 text-xs" 
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <Input 
                      type="date" 
                      className="w-full sm:w-40 h-10 text-xs" 
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="h-10 px-4" disabled={taskMutation.isPending}>
                      Agendar
                    </Button>
                 </form>
               </div>
            </div>
            
            {/* Timeline Unificada (Notas + Eventos) */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-neutral-900 dark:text-neutral-50">
               <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-2">
                 <History className="w-5 h-5 text-primary" />
                 <h2 className="font-bold text-lg">Timeline de Atividades</h2>
               </div>
               <div className="p-6 relative">
                 {/* Linha Vertical da Timeline */}
                 <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-border sm:block hidden" />
                 
                 <div className="space-y-8">
                   {(isLoadingNotes || isLoadingEvents) ? (
                     <div className="animate-pulse flex items-center justify-center p-4">Sincronizando timeline...</div>
                   ) : timelineItems.length > 0 ? (
                     timelineItems.map((item) => (
                       <div key={item.id} className="relative flex gap-6 items-start">
                         {/* Círculo do Ícone */}
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${item.type === 'note' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                           {item.icon}
                         </div>
                         
                         <div className="flex-1 pt-1">
                           <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                             <div className={`text-sm font-semibold ${item.type === 'event' ? 'text-primary/70 italic' : ''}`}>
                               {item.type === 'note' ? 'Nota Interna' : item.content}
                             </div>
                             <div className="text-[10px] font-bold opacity-40 flex items-center gap-1 uppercase tracking-widest">
                               <Clock className="w-3 h-3" />
                               {new Date(item.created_at).toLocaleString('pt-BR')}
                             </div>
                           </div>
                           
                           {item.type === 'note' && (
                             <div className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-3 rounded-lg border border-border/50">
                               {item.content}
                             </div>
                           )}
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-10 opacity-40 italic flex flex-col items-center gap-3">
                        <Package className="w-8 h-8" />
                        <p className="text-sm">Nenhuma atividade registrada ainda.</p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 bg-primary/5">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-primary">
                 <Send className="w-4 h-4" />
                 Anotação Rápida
              </h2>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-input bg-background/50 p-3 text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Observações de contato..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="w-full rounded-lg" 
                  disabled={noteMutation.isPending || !newNote.trim()}
                >
                  {noteMutation.isPending ? "Salvando..." : "Salvar Nota"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
