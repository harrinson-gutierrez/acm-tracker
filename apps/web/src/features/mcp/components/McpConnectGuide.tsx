import { Panel } from "../../../components/Panel";
import { CopyButton } from "../../../components/CopyButton";
import { useMcpConfig } from "../api/use-mcp";
import { colors, radius } from "../../../theme/tokens";

const STEPS = [
  "Copia la configuración de abajo.",
  "Pégala en tu archivo de configuración de Claude Code (~/.claude.json) o en el de Claude Desktop (claude_desktop_config.json). También puedes correr `claude mcp add` y apuntar al comando.",
  "Reinicia Claude Code; verás las tools report_work / list_projects / list_tasks.",
  'Dile al agente algo como: "registra 45 min en la tarea T-142, usé opus con 1240/980 tokens" y reportará solo.',
];

function StepList() {
  return (
    <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>
      {STEPS.map((step) => (
        <li key={step} style={{ fontSize: 13, color: colors.text, lineHeight: 1.5 }}>
          {step}
        </li>
      ))}
    </ol>
  );
}

export function McpConnectGuide() {
  const { data: config } = useMcpConfig();
  if (!config) return null;

  const json = JSON.stringify(config.claudeConfig, null, 2);

  return (
    <Panel title="Conectar un agente (Claude Code)" style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <StepList />
      </div>

      {config.mcpServerPath === null && (
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: colors.amber,
            background: colors.surface2,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.sm,
            padding: "10px 12px",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          El servidor MCP no está empaquetado en esta instalación; usa el repo:
          node packages/mcp/dist/index.js
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.muted }}>
          CONFIGURACIÓN
        </span>
        <CopyButton text={json} label="Copiar configuración" />
      </div>
      <pre
        className="mono"
        style={{
          fontSize: 11,
          color: colors.text,
          background: colors.surface2,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          padding: "12px 14px",
          margin: 0,
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
        }}
      >
        {json}
      </pre>
    </Panel>
  );
}
