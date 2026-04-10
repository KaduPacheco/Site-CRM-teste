import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock do contexto de autenticação usando caminho relativo
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';

describe('ProtectedRoute - Segurança de Rota', () => {
  it('deve exibir o Spinner quando estiver carregando a sessão', () => {
    (useAuth as any).mockReturnValue({ session: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('deve permitir acesso (\'Outlet\') quando houver sessão ativa', async () => {
    (useAuth as any).mockReturnValue({ session: { user: {} }, loading: false });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteúdo Privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Conteúdo Privado')).toBeInTheDocument();
  });

  it('deve redirecionar para login quando não houver sessão', () => {
    (useAuth as any).mockReturnValue({ session: null, loading: false });

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteúdo Privado</div>} />
          </Route>
          <Route path="/crm/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Página de Login')).toBeInTheDocument();
    expect(queryByText('Conteúdo Privado')).not.toBeInTheDocument();
  });
});
