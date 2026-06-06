import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { TileRow } from "../components/TileRow";
import { StackedBars } from "../components/StackedBars";
import { DataTable } from "../components/DataTable";
import { useCostByPerson, useWeeklyCost } from "../features/reporting/api/use-reporting";
import { colors } from "../theme/tokens";

export function Reports() {
  const { data: people = [] } = useCostByPerson();
  const { data: weekly = [] } = useWeeklyCost();
  const totalHuman = people.reduce((s, p) => s + p.human, 0);
  const totalMinutes = people.reduce((s, p) => s + p.minutes, 0);
  const totalHours = Math.round(totalMinutes / 60);
  const avgRate = totalHours > 0 ? (totalHuman / totalHours).toFixed(1) : "0";

  return (
    <Chrome breadcrumb="/ reportes · últimos 30 días">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Reportes · analítica</h1>
      <div className="mono" style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
        TIEMPO + COSTO · humano vs IA · tendencia
      </div>
      <div style={{ marginBottom: 16 }}>
        <TileRow
          columns={5}
          tiles={[
            { label: "Horas", value: `${totalHours}h` },
            { label: "Costo total", value: `$${Math.round(totalHuman)}` },
            { label: "Costo IA", value: "$0", sub: "vía MCP", accent: colors.blue },
            { label: "$/hora prom", value: `$${avgRate}`, accent: colors.green },
            { label: "Personas", value: String(people.length), accent: colors.amber },
          ]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: 16 }}>
        <Panel title="Tiempo+costo · por semana">
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: colors.coral }}>▇ humano</span>
            <span className="mono" style={{ fontSize: 11, color: colors.blue }}>▇ ia</span>
          </div>
          <StackedBars data={weekly.map((w) => ({ label: w.week, human: w.human, ai: w.ai }))} />
        </Panel>
        <Panel title="Por persona · costo real">
          <DataTable
            columns={[
              { key: "name", label: "Persona" },
              { key: "hours", label: "Horas", width: 70, align: "right" },
              { key: "ai", label: "IA", width: 60, align: "right" },
              { key: "cost", label: "Costo", width: 90, align: "right" },
            ]}
            rows={people.map((p) => ({
              id: p.memberId,
              cells: {
                name: <span style={{ fontWeight: 600 }}>{p.name}</span>,
                hours: <span className="mono" style={{ color: colors.muted }}>{Math.floor(p.minutes / 60)}h</span>,
                ai: <span className="mono" style={{ color: colors.blue }}>${p.ai}</span>,
                cost: <span className="mono" style={{ fontWeight: 700 }}>${p.total}</span>,
              },
            }))}
            emptyLabel="Sin datos aún."
          />
        </Panel>
      </div>
      <div style={{ marginTop: 16 }}>
        <Panel title="Exportar / facturar">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { t: "CSV · time entries", d: "todas las entradas con costo desglosado" },
              { t: "PDF · reporte cliente", d: "resumen por proyecto, horas y monto" },
              { t: "Factura Helios", d: "listo para enviar" },
            ].map((c) => (
              <div key={c.t} style={{ background: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 18 }}>
                <div style={{ fontWeight: 600 }}>{c.t}</div>
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{c.d}</div>
                <button disabled style={{ marginTop: 14, background: "transparent", color: colors.dim, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 14px" }}>
                  Generar → próximamente
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Chrome>
  );
}
