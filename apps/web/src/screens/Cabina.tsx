import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { RingGauge } from "../components/RingGauge";
import { TileRow } from "../components/TileRow";
import { PersonCostRow } from "../components/PersonCostRow";
import { McpStream } from "../components/McpStream";
import { TimerDock } from "../components/TimerDock";
import { useTodaySummary, useTeamToday } from "../features/reporting/api/use-today";
import { useIsMobile } from "../lib/use-is-mobile";
import { colors } from "../theme/tokens";

function hm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function Cabina() {
  const { data: today } = useTodaySummary();
  const { data: team = [] } = useTeamToday();
  const isMobile = useIsMobile();
  const cost = today?.cost ?? 0;
  return (
    <Chrome breadcrumb="FLIGHT DECK · cabina" status="SYSTEMS NOMINAL">
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "560px 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Burn rate · hoy">
            <div className="mono" style={{ fontSize: 11, color: colors.dim, marginTop: -6, marginBottom: 8 }}>vs objetivo diario $2,400</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RingGauge total={cost} target={2400} aiFraction={0} caption="del objetivo" size={isMobile ? 200 : 260} />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, background: colors.coral, borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 12 }}>Humano ${cost}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, background: colors.blue, borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 12 }}>IA $0 · vía MCP</span>
              </span>
            </div>
          </Panel>
          <TileRow
            columns={isMobile ? 2 : 4}
            tiles={[
              { label: "Hoy", value: today ? hm(today.trackedMinutes) : "—", sub: "trackeado" },
              { label: "Semana", value: "—", sub: "de 40h" },
              { label: "Facturable", value: today ? hm(today.billableMinutes) : "—", accent: colors.green },
              { label: "Margen", value: "—", sub: "Helios", accent: colors.amber },
            ]}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Equipo · costo real hoy">
            {team.map((p, i) => (
              <PersonCostRow
                key={p.memberId}
                initials={p.initials}
                index={i}
                name={p.name}
                meta={`${hm(p.trackedMinutes)} · trackeado`}
                cost={`$${p.cost}`}
              />
            ))}
            {team.length === 0 && <div style={{ color: colors.muted, fontSize: 13 }}>Sin actividad hoy.</div>}
          </Panel>
          <Panel title="MCP · ingesta en vivo">
            <McpStream rows={[]} emptyLabel="Sin reportes — conecta un agente al servidor MCP." />
          </Panel>
        </div>
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
