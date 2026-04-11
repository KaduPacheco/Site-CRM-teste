import { describe, expect, it, vi } from "vitest";
import { buildLeadTaskSummary, getLeadStageValue } from "../crmLeadPresentation";

describe("crmLeadPresentation", () => {
  it("normalizes the commercial stage using pipeline_stage first", () => {
    expect(getLeadStageValue({ pipeline_stage: "qualificado", status: "novo" })).toBe("qualificado");
    expect(getLeadStageValue({ pipeline_stage: null, status: "ganho" })).toBe("ganho");
    expect(getLeadStageValue({ pipeline_stage: null, status: "desconhecido" })).toBe("without_stage");
  });

  it("builds the operational task summary with next task and overdue count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));

    const summary = buildLeadTaskSummary([
      {
        id: "task-1",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Ligar hoje",
        due_date: "2026-04-11T10:00:00.000Z",
        completed: false,
      },
      {
        id: "task-2",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Enviar proposta",
        due_date: "2026-04-12T10:00:00.000Z",
        completed: false,
      },
      {
        id: "task-3",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Concluida",
        due_date: "2026-04-10T10:00:00.000Z",
        completed: true,
      },
    ]);

    expect(summary).toEqual(
      expect.objectContaining({
        openCount: 2,
        overdueCount: 1,
        nextTask: expect.objectContaining({
          id: "task-1",
          title: "Ligar hoje",
        }),
      }),
    );

    vi.useRealTimers();
  });
});
