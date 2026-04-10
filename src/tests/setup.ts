import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global do fetch para evitar chamadas reais em testes de serviço
global.fetch = vi.fn();
