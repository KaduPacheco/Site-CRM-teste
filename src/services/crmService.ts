import { CrmLead } from "@/types/crm";
import { supabase } from "@/lib/supabase";

/**
 * Busca a listagem crua de Leads do banco.
 * Para uso exclusivo na Rota de CRM.
 * Agora utiliza o SDK autenticado para respeitar RLS.
 */
export async function getCrmLeads(): Promise<CrmLead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar leads: ${error.message}`);
  }

  return data as CrmLead[];
}

/**
 * Registra um evento no histórico do lead (Audit Log).
 * @param leadId ID do lead associado.
 * @param eventType Tipo de evento (ex: 'note_added', 'task_completed').
 * @param payload Dados extras do evento.
 * @returns O evento registrado ou null em caso de erro.
 */
export async function logLeadEvent(leadId: string, eventType: string, payload: any = {}) {
  const { data, error } = await supabase
    .from('lead_events')
    .insert([{ lead_id: leadId, event_type: eventType, payload }])
    .select()
    .single();

  if (error) {
    // Audit failure: logamos no console para depuração mas não interrompemos o fluxo principal (UX first).
    console.error(`[Audit Log Failure] Tentativa de registrar '${eventType}' para o lead ${leadId} falhou:`, error.message);
  }

  return data;
}

/**
 * Busca o histórico de eventos de sistema
 */
export async function getLeadEvents(leadId: string) {
  const { data, error } = await supabase
    .from('lead_events')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar eventos: ${error.message}`);
  }

  return data;
}

/**
 * Busca detalhes de um Lead único
 */
export async function getCrmLeadById(id: string): Promise<CrmLead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Falha ao buscar detalhes do lead: ${error.message}`);
  }

  if (!data) {
    throw new Error("Lead não encontrado");
  }
  
  return data as CrmLead;
}

/**
 * Busca todas as notas de um lead específico
 */
export async function getLeadNotes(leadId: string) {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar notas: ${error.message}`);
  }

  return data;
}

/**
 * Cria uma nova nota para um lead
 */
export async function createLeadNote(leadId: string, content: string, authorId: string) {
  const { data, error } = await supabase
    .from('lead_notes')
    .insert([
      { 
        lead_id: leadId, 
        content, 
        author_id: authorId 
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao criar nota: ${error.message}`);
  }

  // Registrar Evento
  await logLeadEvent(leadId, 'note_added', { content_preview: content.substring(0, 50) });

  return data;
}

/**
 * Busca todas as tarefas de um lead
 */
export async function getLeadTasks(leadId: string) {
  const { data, error } = await supabase
    .from('lead_tasks')
    .select('*')
    .eq('lead_id', leadId)
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(`Falha ao buscar tarefas: ${error.message}`);
  }

  return data;
}

/**
 * Cria uma nova tarefa para um lead
 */
export async function createLeadTask(task: { lead_id: string, title: string, due_date: string, assignee_id: string }) {
  const { data, error } = await supabase
    .from('lead_tasks')
    .insert([task])
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao criar tarefa: ${error.message}`);
  }

  // Registrar Evento
  await logLeadEvent(task.lead_id, 'task_added', { title: task.title });

  return data;
}

/**
 * Atualiza o status de conclusão de uma tarefa
 */
export async function updateTaskStatus(taskId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('lead_tasks')
    .update({ completed, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao atualizar tarefa: ${error.message}`);
  }

  // Registrar Evento
  await logLeadEvent(data.lead_id, completed ? 'task_completed' : 'task_reopened', { title: data.title });

  return data;
}
