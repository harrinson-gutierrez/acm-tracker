import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { StatTile } from "../components/StatTile";
import { StackedBars } from "../components/StackedBars";
import { useCostByPerson, useWeeklyCost } from "../features/reporting/api/use-reporting";
import { colors } from "../theme/tokens";

export function Reports() {
  const { data: people = [] } = useCostByPerson();
  const { data: weekly = [] } = useWeeklyCost();
  const totalHuman = people.reduce((s, p) => s + p.human, 0);
  return (
    <Chrome breadcrumb="/ reportes">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatTile label="Personas" value={String(people.length)} />
        <StatTile label="Costo humano" value={`$${Math.round(totalHuman)}`} accent={colors.green} />
        <StatTile label="Costo IA" value="$0" sub="vía MCP" accent={colors.blue} />
        <StatTile label="Semanas" value={String(weekly.length)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Tiempo+costo · por semana">
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: colors.coral }}>▇ humano</span>
            <span className="mono" style={{ fontSize: 11, color: colors.blue }}>▇ ia</span>
          </div>
          <StackedBars data={weekly.map((w) => ({ label: w.week, human: w.human, ai: w.ai }))} />
        </Panel>
        <Panel title="Por persona · costo real">
          {people.map((p) => (
            <div key={p.memberId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span>{p.name}</span>
              <span className="mono">{Math.floor(p.minutes / 60)}h · ${p.total}</span>
            </div>
          ))}
          {people.length === 0 && <p style={{ color: colors.muted }}>Sin datos aún.</p>}
        </Panel>
      </div>
    </Chrome>
  );
}
