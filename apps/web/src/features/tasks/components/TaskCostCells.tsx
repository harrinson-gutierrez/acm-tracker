import { useTaskCost, useCreateTimeEntry } from "../../time-entries/api/use-time-entries";
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

export function AddTimeButton({ taskId }: { taskId: string }) {
  const createEntry = useCreateTimeEntry();
  const addTime = () => {
    const raw = window.prompt("Minutos trabajados:");
    const minutes = Number(raw ?? "0");
    if (Number.isFinite(minutes) && minutes > 0) {
      createEntry.mutate({ taskId, minutes });
    }
  };
  return (
    <button onClick={addTime} disabled={createEntry.isPending} style={{ background: "transparent", color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 12px" }}>
      + tiempo
    </button>
  );
}
