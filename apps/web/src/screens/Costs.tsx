import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { DonutGauge } from "../components/DonutGauge";
import { TileRow } from "../components/TileRow";
import { DataTable } from "../components/DataTable";
import { useProjects } from "../features/projects/api/use-projects";
import { useModelPrices } from "../features/model-pricing/api/use-model-prices";
import { colors } from "../theme/tokens";

export function Costs() {
  const { data: projects = [] } = useProjects();
  const { data: prices = [] } = useModelPrices();
  return (
    <Chrome breadcrumb="/ costos · mes actual">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Costos · mes actual</h1>
      <div className="mono" style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
        TIEMPO HUMANO + IA + INFRA · una sola fuente de verdad
      </div>
      <div style={{ marginBottom: 16 }}>
        <TileRow
          tiles={[
            { label: "Proyectos", value: String(projects.length), sub: "activos" },
            { label: "Humano", value: "real", sub: "por proyecto" },
            { label: "IA", value: "$0", sub: "vía MCP · próximamente", accent: colors.blue },
            { label: "Modelos", value: String(prices.length), sub: "con precio", accent: colors.amber },
          ]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <Panel title="Composición del costo">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DonutGauge
              segments={[
                { value: 1, color: colors.coral, label: "Humano" },
                { value: 0, color: colors.blue, label: "IA" },
              ]}
              centerLabel="Humano"
            />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
            <span className="mono" style={{ fontSize: 11, color: colors.coral }}>▇ Humano</span>
            <span className="mono" style={{ fontSize: 11, color: colors.blue }}>▇ IA</span>
          </div>
        </Panel>
        <Panel title="IA · costo por modelo (USD / 1M tokens)">
          <DataTable
            columns={[
              { key: "model", label: "Modelo" },
              { key: "in", label: "Input", width: 120, align: "right" },
              { key: "out", label: "Output", width: 120, align: "right" },
              { key: "cost", label: "Costo", width: 100, align: "right" },
            ]}
            rows={prices.map((p) => ({
              id: p.id,
              cells: {
                model: <span className="mono">{p.model}</span>,
                in: <span className="mono" style={{ color: colors.green }}>${p.inputPer1M}</span>,
                out: <span className="mono" style={{ color: colors.green }}>${p.outputPer1M}</span>,
                cost: <span className="mono" style={{ color: colors.dim }}>$0</span>,
              },
            }))}
            emptyLabel="Sin modelos. Añádelos en Settings."
          />
        </Panel>
      </div>
    </Chrome>
  );
}
