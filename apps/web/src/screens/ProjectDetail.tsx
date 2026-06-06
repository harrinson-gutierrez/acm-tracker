import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { Avatar } from "../components/Avatar";
import { DonutGauge } from "../components/DonutGauge";
import { DataTable } from "../components/DataTable";
import { useProject } from "../features/projects/api/use-projects";
import { useTasks, useCreateTask } from "../features/tasks/api/use-tasks";
import { useProjectCost } from "../features/reporting/api/use-reporting";
import { TaskRealCell, TaskCostCell, AddTimeButton } from "../features/tasks/components/TaskCostCells";
import { colors } from "../theme/tokens";

const TABS = ["Resumen", "Tareas", "Tiempo", "Costos", "Equipo", "Documentos"];

export function ProjectDetail() {
  const { id = "" } = useParams();
  const { data: project } = useProject(id);
  const { data: tasks = [] } = useTasks(id);
  const { data: cost } = useProjectCost(id);
  const createTask = useCreateTask(id);
  const [title, setTitle] = useState("");

  const add = () => {
    if (!title.trim()) return;
    const code = `T-${String(tasks.length + 1).padStart(3, "0")}`;
    createTask.mutate({ code, title: title.trim() }, { onSuccess: () => setTitle("") });
  };

  const consumed = cost?.total ?? 0;
  const contract = project?.contractAmount ?? 0;
  const pct = contract > 0 ? Math.min(consumed / contract, 1) : 0;

  return (
    <Chrome breadcrumb={`/ proyectos / ${project?.name ?? id}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <Avatar initials="HE" index={0} size={56} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{project ? `${project.name} · Plataforma fintech` : "—"}</h1>
          <div className="mono" style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            CLIENTE ACTIVO · contrato ${contract.toLocaleString("en-US")} · etiqueta: ejecución
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 28, marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <span key={t} className="mono" style={{ fontSize: 14, color: i === 0 ? colors.coral : colors.muted, borderBottom: i === 0 ? `2px solid ${colors.coral}` : "none", paddingBottom: 4 }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Panel title="Costo real · acumulado">
          <div className="mono" style={{ fontSize: 44, fontWeight: 700 }}>${consumed.toLocaleString("en-US")}</div>
          <div className="mono" style={{ fontSize: 12, color: colors.dim, marginBottom: 12 }}>
            de ${contract.toLocaleString("en-US")} contratado · {Math.round(pct * 100)}% consumido
          </div>
          <div style={{ height: 8, background: colors.surface2, borderRadius: 4 }}>
            <div style={{ height: 8, width: `${pct * 100}%`, background: colors.coral, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: colors.muted, letterSpacing: 1 }}>HUMANO</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>${cost?.human ?? 0}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, color: colors.muted, letterSpacing: 1 }}>IA</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: colors.blue }}>${cost?.ai ?? 0}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, color: colors.muted, letterSpacing: 1 }}>HORAS</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{cost ? Math.floor(cost.minutes / 60) : 0}h</div>
            </div>
          </div>
        </Panel>
        <Panel title="Margen">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DonutGauge segments={[{ value: 1, color: colors.green, label: "margen" }]} centerLabel="—" />
          </div>
        </Panel>
      </div>

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
          <button onClick={add} disabled={createTask.isPending} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700 }}>
            + Tarea
          </button>
        </div>
        <DataTable
          columns={[
            { key: "code", label: "ID", width: 80 },
            { key: "title", label: "Tarea" },
            { key: "real", label: "Real", width: 100, align: "right" },
            { key: "cost", label: "Costo", width: 90, align: "right" },
            { key: "action", label: "", width: 110, align: "right" },
          ]}
          rows={tasks.map((t) => ({
            id: t.id,
            cells: {
              code: <span className="mono" style={{ color: colors.coral }}>{t.code}</span>,
              title: t.title,
              real: <TaskRealCell taskId={t.id} />,
              cost: <TaskCostCell taskId={t.id} />,
              action: <AddTimeButton taskId={t.id} />,
            },
          }))}
          emptyLabel="Sin tareas aún."
        />
      </Panel>

      <div style={{ marginTop: 12 }}>
        <Link to="/projects" className="mono" style={{ color: colors.muted, fontSize: 13 }}>← Proyectos</Link>
      </div>
    </Chrome>
  );
}
