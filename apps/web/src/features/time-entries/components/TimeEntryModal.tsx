import { useEffect, useState } from "react";
import { useProjects } from "../../projects/api/use-projects";
import { useTasks } from "../../tasks/api/use-tasks";
import { useCreateTimeEntry } from "../api/use-time-entries";
import { useTimeEntryModal } from "../use-time-entry-modal";
import { colors } from "../../../theme/tokens";

const field = {
  width: "100%",
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: 8,
  padding: "10px 12px",
  marginTop: 6,
} as const;

const labelStyle = { fontSize: 11, letterSpacing: 1, color: colors.muted } as const;

export function TimeEntryModal() {
  const { open, presetTaskId, presetProjectId, close } = useTimeEntryModal();
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState("");
  const { data: tasks = [] } = useTasks(projectId);
  const [taskId, setTaskId] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [billable, setBillable] = useState(true);
  const createEntry = useCreateTimeEntry();

  useEffect(() => {
    if (!open) return;
    setProjectId(presetProjectId ?? projects[0]?.id ?? "");
    setTaskId(presetTaskId ?? "");
    setMinutes("60");
    setBillable(true);
  }, [open, presetProjectId, presetTaskId, projects]);

  useEffect(() => {
    if (!presetTaskId && tasks.length > 0 && !tasks.some((t) => t.id === taskId)) {
      setTaskId(tasks[0].id);
    }
  }, [tasks, presetTaskId, taskId]);

  if (!open) return null;

  const canSave = Boolean(taskId) && Number(minutes) > 0 && !createEntry.isPending;

  const save = () => {
    if (!canSave) return;
    createEntry.mutate(
      { taskId, minutes: Number(minutes), billable },
      { onSuccess: () => close() },
    );
  };

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 140, zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Registrar tiempo" style={{ width: 480, background: colors.surface, border: `1px solid ${colors.borderStrong}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Registrar tiempo</h3>
        <p className="mono" style={{ fontSize: 11, color: colors.muted, marginBottom: 20 }}>tiempo humano · se valora con la tarifa de la persona</p>

        <label style={labelStyle}>PROYECTO</label>
        <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setTaskId(""); }} aria-label="Proyecto" style={field}>
          {projects.length === 0 && <option value="">— sin proyectos —</option>}
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>TAREA</label>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} aria-label="Tarea" style={field}>
            {tasks.length === 0 && <option value="">— sin tareas en este proyecto —</option>}
            {tasks.map((t) => <option key={t.id} value={t.id}>{t.code} · {t.title}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>MINUTOS</label>
            <input value={minutes} onChange={(e) => setMinutes(e.target.value)} type="number" min={1} aria-label="Minutos" style={field} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, color: colors.text, fontSize: 13 }}>
            <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} aria-label="Facturable" />
            Facturable
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={close} style={{ background: "transparent", color: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 18px" }}>Cancelar</button>
          <button onClick={save} disabled={!canSave} style={{ background: canSave ? colors.coral : colors.surface2, color: canSave ? colors.bg : colors.dim, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700 }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
