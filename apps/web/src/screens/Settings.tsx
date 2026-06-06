import { useState } from "react";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { useMembers } from "../features/members/api/use-members";
import { useModelPrices, useCreateModelPrice } from "../features/model-pricing/api/use-model-prices";
import { colors } from "../theme/tokens";

const inputStyle = {
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: 8,
  padding: "8px 10px",
} as const;

export function Settings() {
  const { data: members = [], isLoading } = useMembers();
  const { data: prices = [] } = useModelPrices();
  const createPrice = useCreateModelPrice();
  const [model, setModel] = useState("");
  const [inputPer1M, setInputPer1M] = useState("");
  const [outputPer1M, setOutputPer1M] = useState("");

  const addPrice = () => {
    if (!model.trim()) return;
    createPrice.mutate(
      {
        provider: "anthropic",
        model: model.trim(),
        inputPer1M: Number(inputPer1M) || 0,
        outputPer1M: Number(outputPer1M) || 0,
      },
      {
        onSuccess: () => {
          setModel("");
          setInputPer1M("");
          setOutputPer1M("");
        },
      },
    );
  };

  return (
    <Chrome breadcrumb="/ settings">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
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

        <Panel title="Precios de modelos · USD / 1M tokens">
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="modelo" aria-label="Modelo" style={{ ...inputStyle, flex: 2 }} />
            <input value={inputPer1M} onChange={(e) => setInputPer1M(e.target.value)} placeholder="in" aria-label="Precio input" style={{ ...inputStyle, width: 56 }} />
            <input value={outputPer1M} onChange={(e) => setOutputPer1M(e.target.value)} placeholder="out" aria-label="Precio output" style={{ ...inputStyle, width: 56 }} />
            <button onClick={addPrice} disabled={createPrice.isPending} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700 }}>
              +
            </button>
          </div>
          {prices.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span className="mono">{p.model}</span>
              <span className="mono" style={{ color: colors.green }}>${p.inputPer1M} / ${p.outputPer1M}</span>
            </div>
          ))}
          {prices.length === 0 && <p style={{ color: colors.muted, fontSize: 13 }}>Sin modelos aún.</p>}
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
