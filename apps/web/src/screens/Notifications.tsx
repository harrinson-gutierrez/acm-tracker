import { useState } from "react";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { DataTable } from "../components/DataTable";
import { useNotificationRules, useCreateNotificationRule, useToggleNotificationRule, useDeleteNotificationRule } from "../features/notifications/api/use-notification-rules";
import { colors } from "../theme/tokens";

const CHANNELS = ["Slack", "Email", "WhatsApp", "Webhook"];

const inputStyle = {
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: 8,
  padding: "8px 10px",
} as const;

export function Notifications() {
  const { data: rules = [] } = useNotificationRules();
  const createRule = useCreateNotificationRule();
  const toggleRule = useToggleNotificationRule();
  const deleteRule = useDeleteNotificationRule();
  const [event, setEvent] = useState("");
  const [condition, setCondition] = useState("");
  const [channel, setChannel] = useState("Slack");

  const add = () => {
    if (!event.trim()) return;
    createRule.mutate(
      { event: event.trim(), condition: condition.trim() || "—", channel },
      { onSuccess: () => { setEvent(""); setCondition(""); } },
    );
  };

  return (
    <Chrome breadcrumb="/ settings / notificaciones">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Notificaciones</h1>
      <div className="mono" style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
        SOLO AVISOS SALIENTES · ACM-TRACKER es la única fuente de verdad
      </div>
      <div style={{ background: colors.surface, border: `1px solid ${colors.amber}`, borderRadius: 10, padding: 16, marginBottom: 16, color: colors.text, fontSize: 13 }}>
        ⓘ Estos canales NO sincronizan trabajo. Solo te avisan cuando algo pasa aquí (aprobaciones, topes, reportes). El registro vive en ACM-TRACKER.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        {CHANNELS.map((c) => (
          <Panel key={c} title={c}>
            <div className="mono" style={{ fontSize: 11, color: colors.muted }}>● disponible</div>
          </Panel>
        ))}
      </div>

      <Panel title="Reglas de aviso">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Evento (ej. Tope de presupuesto)" aria-label="Evento" style={{ ...inputStyle, flex: 2 }} />
          <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condición" aria-label="Condición" style={{ ...inputStyle, flex: 2 }} />
          <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Canal" style={{ ...inputStyle, width: 130 }}>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={add} disabled={createRule.isPending} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700 }}>
            + Regla
          </button>
        </div>
        <DataTable
          columns={[
            { key: "event", label: "Evento" },
            { key: "condition", label: "Condición" },
            { key: "channel", label: "Canal", width: 120 },
            { key: "toggle", label: "Activa", width: 70, align: "right" },
            { key: "action", label: "", width: 80, align: "right" },
          ]}
          rows={rules.map((r) => ({
            id: r.id,
            cells: {
              event: <span style={{ fontWeight: 600 }}>{r.event}</span>,
              condition: <span style={{ color: colors.muted, fontSize: 12 }}>{r.condition}</span>,
              channel: <span className="mono" style={{ color: colors.coral, fontSize: 12 }}>{r.channel}</span>,
              toggle: (
                <button
                  onClick={() => toggleRule.mutate({ id: r.id, enabled: !r.enabled })}
                  style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: r.enabled ? colors.green : colors.surface2, position: "relative" }}
                  aria-label={`Activar regla ${r.event}`}
                >
                  <span style={{ position: "absolute", top: 3, left: r.enabled ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left .15s" }} />
                </button>
              ),
              action: (
                <button onClick={() => deleteRule.mutate(r.id)} aria-label={`Borrar regla ${r.event}`} style={{ background: "transparent", color: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                  Borrar
                </button>
              ),
            },
          }))}
          emptyLabel="Sin reglas. Crea la primera arriba."
        />
      </Panel>
    </Chrome>
  );
}
