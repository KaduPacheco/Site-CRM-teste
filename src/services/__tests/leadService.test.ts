import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitLeadToSupabase } from '../leadService';

describe('leadService - Resiliência e API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const leadData = {
    nome: 'Teste Erro',
    whatsapp: '11999999999',
    empresa: 'Empresa Erro',
    funcionarios: 10
  };

  it('deve lançar erro amigável se o Supabase retornar status de falha', async () => {
    // Mocking fetch error response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Database connection failed')
    });

    await expect(submitLeadToSupabase(leadData)).rejects.toThrow('Erro ao salvar lead (Status 500)');
  });

  it('deve retornar true mesmo se o n8n falhar (resiliência)', async () => {
    // 1º fetch (Supabase) = OK
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('OK')
    });
    
    // 2º fetch (n8n) = Failure
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await submitLeadToSupabase(leadData);
    expect(result).toBe(true);
  });
});
