import { useState } from "react";
import { useParams } from "react-router-dom";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { useProject } from "../features/projects/api/use-projects";
import { useTasks, useCreateTask } from "../features/tasks/api/use-tasks";
import { TaskRow } from "../features/tasks/components/TaskRow";
import { colors } from "../theme/tokens";

export function ProjectDetail() {
  const { id = "" } = useParams();
  const { data: project } = useProject(id);
  const { data: tasks = [] } = useTasks(id);
  const createTask = useCreateTask(id);
  const [title, setTitle] = useState("");

  const add = () => {
    if (!title.trim()) return;
    const code = `T-${String(tasks.length + 1).padStart(3, "0")}`;
    createTask.mutate({ code, title: title.trim() }, { onSuccess: () => setTitle("") });
  };

  return (
    <Chrome breadcrumb={`/ proyectos / ${project?.name ?? id}`}>
      <Panel title={`Tareas · tiempo + costo — ${project?.name ?? ""}`}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Nueva tarea…"
            aria-label="Título de la tarea"
            style={{ flex: 1, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.text, borderRadius: 8, padding: "10px 12px" }}
          />
          <button
            onClick={add}
            disabled={createTask.isPending}
            style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700 }}
          >
            + Tarea
          </button>
        </div>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
        {tasks.length === 0 && <p style={{ color: colors.muted }}>Sin tareas aún.</p>}
      </Panel>
    </Chrome>
  );
}
