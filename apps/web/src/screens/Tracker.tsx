import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { TileRow } from "../components/TileRow";
import { DataTable } from "../components/DataTable";
import { Tag } from "../components/Tag";
import { TimerDock } from "../components/TimerDock";
import { useTodayEntries } from "../features/time-entries/api/use-today-entries";
import { useTodaySummary } from "../features/reporting/api/use-today";
import { colors } from "../theme/tokens";

function hm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function Tracker() {
  const { data: entries = [] } = useTodayEntries();
  const { data: today } = useTodaySummary();

  return (
    <Chrome breadcrumb="/ tiempo · hoy">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Tiempo · hoy</h1>
      <div className="mono" style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
        ENTRADAS HUMANAS + REPORTES MCP · conciliadas por tarea
      </div>
      <div style={{ marginBottom: 16 }}>
        <TileRow
          tiles={[
            { label: "Trackeado hoy", value: today ? hm(today.trackedMinutes) : "—" },
            { label: "Facturable", value: today ? hm(today.billableMinutes) : "—", accent: colors.green },
            { label: "Costo hoy", value: today ? `$${today.cost}` : "—" },
            { label: "De IA", value: "$0", accent: colors.blue },
          ]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        <Panel title="Línea de tiempo">
          <DataTable
            columns={[
              { key: "time", label: "Hora", width: 70 },
              { key: "origin", label: "Origen", width: 90 },
              { key: "task", label: "Tarea" },
              { key: "dur", label: "Duración", width: 100, align: "right" },
              { key: "cost", label: "Costo", width: 80, align: "right" },
            ]}
            rows={entries.map((e) => ({
              id: e.id,
              cells: {
                time: <span className="mono" style={{ color: colors.dim }}>{e.time}</span>,
                origin: <Tag label={e.origin} color={e.origin === "mcp" ? colors.blue : colors.muted} />,
                task: <span style={{ fontWeight: 500 }}>{e.taskCode} · {e.taskTitle}</span>,
                dur: <span className="mono" style={{ color: colors.muted }}>{hm(e.minutes)}</span>,
                cost: <span className="mono" style={{ fontWeight: 700 }}>${e.cost}</span>,
              },
            }))}
            emptyLabel="Sin entradas hoy. Registra tiempo en una tarea."
          />
        </Panel>
        <Panel title="Objetivo del día">
          <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>{today ? hm(today.trackedMinutes) : "—"} / 8h</div>
          <div style={{ height: 8, background: colors.surface2, borderRadius: 4, marginTop: 12 }}>
            <div style={{ height: 8, width: `${today ? Math.min((today.trackedMinutes / 480) * 100, 100) : 0}%`, background: colors.coral, borderRadius: 4 }} />
          </div>
        </Panel>
      </div>
      <TimerDock
        elapsed="00:00:00"
        taskTitle="Sin tarea activa"
        meta="inicia el timer en un proyecto"
        onStop={() => {}}
        onManual={() => {}}
      />
    </Chrome>
  );
}
