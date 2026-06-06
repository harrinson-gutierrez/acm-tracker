import { Link } from "react-router-dom";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { Gauge } from "../components/Gauge";
import { colors } from "../theme/tokens";

export function Cabina() {
  return (
    <Chrome breadcrumb="/ cabina">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Burn rate · hoy">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Gauge value={0} target={2400} label="del objetivo" />
          </div>
        </Panel>
        <Panel title="Navegación">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link to="/projects" style={{ color: colors.text }}>→ Proyectos</Link>
            <Link to="/costs" style={{ color: colors.text }}>→ Costos & IA</Link>
            <Link to="/reports" style={{ color: colors.text }}>→ Reportes</Link>
            <Link to="/settings" style={{ color: colors.text }}>→ Settings & tarifas</Link>
          </div>
        </Panel>
      </div>
    </Chrome>
  );
}
