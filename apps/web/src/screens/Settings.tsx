import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { useMembers } from "../features/members/api/use-members";
import { colors } from "../theme/tokens";

export function Settings() {
  const { data: members = [], isLoading } = useMembers();
  return (
    <Chrome breadcrumb="/ settings">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Miembros & tarifas">
          {isLoading && <p style={{ color: colors.muted }}>Cargando…</p>}
          {members.map((m) => (
            <div
              key={m.id}
              style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}
            >
              <span>
                {m.name} <span className="mono" style={{ color: colors.dim, fontSize: 12 }}>· {m.role}</span>
              </span>
              <span className="mono">${m.ratePerHour.toFixed(2)}/h</span>
            </div>
          ))}
        </Panel>
        <Panel title="Proveedor de autenticación">
          <div style={{ opacity: 0.6 }}>
            <p style={{ color: colors.muted, fontSize: 13 }}>
              Modo actual: <b className="mono" style={{ color: colors.green }}>sin auth (owner local)</b>
            </p>
            <button
              disabled
              style={{ marginTop: 12, background: colors.surface2, color: colors.dim, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 16px" }}
            >
              Conectar Cognito · próximamente
            </button>
          </div>
        </Panel>
      </div>
    </Chrome>
  );
}
