import { Panel } from "../../../components/Panel";
import { DataTable } from "../../../components/DataTable";
import { useProjectEntries } from "../api/use-project-entries";
import { colors } from "../../../theme/tokens";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m} min`;
}

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data: entries = [] } = useProjectEntries(projectId);

  return (
    <Panel title="Tiempo · cronología de registros">
      <DataTable
        columns={[
          { key: "when", label: "Fecha/hora", width: 140 },
          { key: "task", label: "Tarea" },
          { key: "person", label: "Persona", width: 160 },
          { key: "minutes", label: "Tiempo", width: 90, align: "right" },
          { key: "cost", label: "Costo", width: 90, align: "right" },
        ]}
        rows={entries.map((e) => ({
          id: e.id,
          cells: {
            when: <span className="mono" style={{ fontSize: 11, color: colors.dim }}>{formatWhen(e.startedAt)}</span>,
            task: (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ color: colors.coral }}>{e.taskCode}</span>
                <span style={{ fontWeight: 600 }}>{e.taskTitle}</span>
              </span>
            ),
            person: <span style={{ color: colors.muted, fontSize: 13 }}>{e.memberName}</span>,
            minutes: <span className="mono">{formatDuration(e.minutes)}</span>,
            cost: <span className="mono" style={{ fontWeight: 700, color: colors.green }}>${e.cost}</span>,
          },
        }))}
        emptyLabel="Sin registros de tiempo aún."
      />
    </Panel>
  );
}
