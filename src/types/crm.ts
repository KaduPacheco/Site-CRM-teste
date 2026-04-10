// Tipos e Interfaces do CRM
// Representam a modelagem de domínio estrita acordada previamente.

export type PipelineStage = "novo" | "em_contato" | "qualificado" | "perdido" | "ganho";

export interface CrmLead {
  id: string; // UUID associado internamente no Postgres
  nome: string;
  whatsapp: string;
  email?: string;
  empresa?: string;
  funcionarios?: number;
  origem: string;
  
  /** 
   * @deprecated Utilize 'pipeline_stage' para novas lógicas de CRM.
   * Mantido apenas para compatibilidade com leads capturados via Landing Page antiga.
   */
  status: string; 

  /** Estágio atual no funil de vendas do CRM */
  pipeline_stage: PipelineStage | null;

  /** UUID do Representante/Admin responsável pelo lead */
  owner_id: string | null; 

  /** Valor estimado de fechamento ou histórico de compras */
  lifetime_value: number | null;
  
  created_at: string; // ISO 8601
  updated_at: string; // Atualizado via moddatetime SQL trigger
  last_interaction_at: string | null;
}

/** Representa uma ação de sistema ou mudança de estado no histórico do lead */
export interface CrmLeadEvent {
  id: string;
  lead_id: string;
  event_type: 'note_added' | 'task_added' | 'task_completed' | 'status_change' | 'pipeline_change' | 'lead_created';
  payload: Record<string, any>;
  created_at: string;
}

export interface CrmLeadNote {
  id: string;
  lead_id: string; // FK
  author_id: string; // UUID user auth
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CrmLeadTask {
  id: string;
  lead_id: string; // FK
  assignee_id: string; // UUID user auth responsável
  title: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
