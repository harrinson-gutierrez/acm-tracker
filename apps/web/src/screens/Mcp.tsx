import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { McpStream } from "../components/McpStream";
import { useMcpReports } from "../features/mcp/api/use-mcp";
import { colors } from "../theme/tokens";

const CONTRACT = `POST /api/mcp/report-work
{
  "taskId":     "T-142",
  "memberEmail":"owner@acm.local",
  "minutes":    45,
  "aiRuns": [{ "model":"claude-opus-4-8", "tokensIn":1240, "tokensOut":980 }],
  "output":     "PR #318 · preToken lambda"
}
→ el servidor calcula el costo IA con la tabla de precios por modelo`;

export function Mcp() {
  const { data: reports = [] } = useMcpReports();
  const online = reports.length >= 0;
  return (
    <Chrome breadcrumb="/ settings / MCP" status={online ? "MCP ONLINE" : "MCP OFFLINE"} statusColor={colors.green}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Servidor MCP</h1>
      <div className="mono" style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
        LA PUERTA DE ENTRADA · agentes reportan trabajo, tiempo y tokens aquí
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Panel title="Endpoint">
          <div className="mono" style={{ background: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "12px 14px", color: colors.green }}>
            POST /api/mcp/report-work
          </div>
          <div className="mono" style={{ fontSize: 11, color: colors.dim, marginTop: 12 }}>
            ● activo · {reports.length} reportes recibidos
          </div>
        </Panel>
        <Panel title="Contrato de reporte · report_work()">
          <pre className="mono" style={{ fontSize: 11, color: colors.text, whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.5 }}>{CONTRACT}</pre>
        </Panel>
      </div>

      <Panel title="Reportes recibidos">
        <McpStream
          rows={reports.map((r) => ({
            time: r.time,
            who: r.person.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
            task: r.task,
            hours: `${Math.floor(r.minutes / 60)}h ${r.minutes % 60}m`,
            cost: `$${r.cost}`,
            ai: r.aiSummary,
            aiColor: r.aiSummary === "sin IA" ? colors.dim : colors.blue,
          }))}
          emptyLabel="Sin reportes — envía un POST a /api/mcp/report-work desde un agente."
        />
      </Panel>
    </Chrome>
  );
}
