import type { Task } from "@acm/shared";
import { useTranslation } from "react-i18next";
import { useTaskCost, useCreateTimeEntry } from "../../time-entries/api/use-time-entries";
import { useStartTimer } from "../../timer/api/use-timer";
import { colors } from "../../../theme/tokens";

function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function TaskRow({ task }: { task: Task }) {
  const { t } = useTranslation();
  const { data: cost } = useTaskCost(task.id);
  const createEntry = useCreateTimeEntry();
  const startTimer = useStartTimer();

  const addTime = () => {
    const raw = window.prompt("Minutos trabajados:");
    const minutes = Number(raw ?? "0");
    if (Number.isFinite(minutes) && minutes > 0) {
      createEntry.mutate({ taskId: task.id, minutes });
    }
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}
    >
      <span className="mono" style={{ color: colors.coral, width: 80 }}>{task.code}</span>
      <span style={{ flex: 1 }}>{task.title}</span>
      <span className="mono" style={{ color: colors.muted, width: 110 }}>
        {cost ? formatDuration(cost.minutes) : "—"}
      </span>
      <span className="mono" style={{ fontWeight: 700, width: 90 }}>
        {cost ? `$${cost.total}` : "—"}
      </span>
      <button
        data-testid={`start-timer-${task.code}`}
        onClick={() => startTimer.mutate(task.id)}
        disabled={startTimer.isPending}
        title={t("timer.startForTask")}
        aria-label={t("timer.startForTask")}
        style={{ background: "transparent", color: colors.coral, border: `1px solid ${colors.coral}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", marginRight: 8 }}
      >▶</button>
      <button
        onClick={addTime}
        disabled={createEntry.isPending}
        style={{ background: "transparent", color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 12px" }}
      >
        + tiempo
      </button>
    </div>
  );
}
