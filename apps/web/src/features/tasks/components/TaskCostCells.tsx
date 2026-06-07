import { useTaskCost } from "../../time-entries/api/use-time-entries";
import { useTimeEntryModal } from "../../time-entries/use-time-entry-modal";
import { colors } from "../../../theme/tokens";

function hm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function TaskRealCell({ taskId }: { taskId: string }) {
  const { data: cost } = useTaskCost(taskId);
  return <span className="mono" style={{ color: colors.muted }}>{cost ? hm(cost.minutes) : "—"}</span>;
}

export function TaskCostCell({ taskId }: { taskId: string }) {
  const { data: cost } = useTaskCost(taskId);
  return <span className="mono" style={{ fontWeight: 700 }}>{cost ? `$${cost.total}` : "—"}</span>;
}

export function AddTimeButton({ taskId, projectId }: { taskId: string; projectId: string }) {
  const openModal = useTimeEntryModal((s) => s.openModal);
  return (
    <button onClick={() => openModal({ taskId, projectId })} aria-label="Agregar tiempo" style={{ background: "transparent", color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 12px" }}>
      + tiempo
    </button>
  );
}
