import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { DonutGauge } from "../components/DonutGauge";
import { StatTile } from "../components/StatTile";
import { useProjects } from "../features/projects/api/use-projects";
import { useModelPrices } from "../features/model-pricing/api/use-model-prices";
import { colors } from "../theme/tokens";

export function Costs() {
  const { data: projects = [] } = useProjects();
  const { data: prices = [] } = useModelPrices();
  return (
    <Chrome breadcrumb="/ costos">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatTile label="Proyectos" value={String(projects.length)} sub="activos" />
        <StatTile label="Humano" value="real" sub="por proyecto" />
        <StatTile label="IA" value="$0" sub="vía MCP · próximamente" accent={colors.blue} />
        <StatTile label="Modelos" value={String(prices.length)} sub="con precio" accent={colors.amber} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
        </Panel>
        <Panel title="Precios de modelos · USD / 1M tokens">
          {prices.length === 0 && <p style={{ color: colors.muted }}>Sin modelos. Añádelos en Settings.</p>}
          {prices.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span className="mono">{p.model}</span>
              <span className="mono" style={{ color: colors.green }}>${p.inputPer1M} / ${p.outputPer1M}</span>
            </div>
          ))}
        </Panel>
      </div>
    </Chrome>
  );
}
