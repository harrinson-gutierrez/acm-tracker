import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { SideNav } from "../components/SideNav";
import { DataTable } from "../components/DataTable";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { EditableRate } from "../components/EditableRate";
import { useMembers, useUpdateMember } from "../features/members/api/use-members";
import { useModelPrices, useCreateModelPrice } from "../features/model-pricing/api/use-model-prices";
import { ModelPriceList } from "../features/model-pricing/components/ModelPriceList";
import { colors } from "../theme/tokens";

const inputStyle = {
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: 8,
  padding: "8px 10px",
} as const;

function initialsOf(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

type Section = "members" | "pricing";

export function Settings() {
  const navigate = useNavigate();
  const { data: members = [] } = useMembers();
  const updateMember = useUpdateMember();
  const { data: prices = [] } = useModelPrices();
  const createPrice = useCreateModelPrice();
  const [section, setSection] = useState<Section>("members");
  const [model, setModel] = useState("");
  const [inputPer1M, setInputPer1M] = useState("");
  const [outputPer1M, setOutputPer1M] = useState("");

  const addPrice = () => {
    if (!model.trim()) return;
    createPrice.mutate(
      { provider: "anthropic", model: model.trim(), inputPer1M: Number(inputPer1M) || 0, outputPer1M: Number(outputPer1M) || 0 },
      { onSuccess: () => { setModel(""); setInputPer1M(""); setOutputPer1M(""); } },
    );
  };

  return (
    <Chrome breadcrumb="/ settings / workspace">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start" }}>
        <SideNav
          title="Ajustes"
          items={[
            { label: "Miembros & tarifas", active: section === "members", onClick: () => setSection("members") },
            { label: "Precios de modelos", active: section === "pricing", onClick: () => setSection("pricing") },
            { label: "MCP & tokens", onClick: () => navigate("/mcp") },
            { label: "Notificaciones", onClick: () => navigate("/notifications") },
          ]}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {section === "members" && (
            <>
              <Panel title="Miembros & tarifas">
                <DataTable
                  columns={[
                    { key: "person", label: "Persona" },
                    { key: "role", label: "Rol", width: 160 },
                    { key: "rate", label: "Tarifa $/h", width: 120, align: "right" },
                    { key: "state", label: "Estado", width: 110, align: "right" },
                  ]}
                  rows={members.map((m, i) => ({
                    id: m.id,
                    cells: {
                      person: (
                        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar initials={initialsOf(m.name)} index={i} size={30} />
                          <span style={{ fontWeight: 600 }}>{m.name}</span>
                        </span>
                      ),
                      role: <span className="mono" style={{ color: colors.muted, fontSize: 12 }}>{m.role}</span>,
                      rate: (
                        <EditableRate
                          value={m.ratePerHour}
                          label={m.name}
                          saving={updateMember.isPending && updateMember.variables?.id === m.id}
                          onSave={(ratePerHour) => updateMember.mutate({ id: m.id, ratePerHour })}
                        />
                      ),
                      state: <Tag label="activo" color={colors.green} />,
                    },
                  }))}
                />
              </Panel>

              <Panel title="Proveedor de autenticación">
                <p style={{ color: colors.muted, fontSize: 13 }}>
                  Modo actual: <b className="mono" style={{ color: colors.green }}>sin auth (owner local)</b>
                </p>
              </Panel>
            </>
          )}

          {section === "pricing" && (
            <Panel title="Precios de modelos · USD / 1M tokens">
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="modelo" aria-label="Modelo" style={{ ...inputStyle, flex: 2 }} />
                <input value={inputPer1M} onChange={(e) => setInputPer1M(e.target.value)} placeholder="in" aria-label="Precio input" style={{ ...inputStyle, width: 70 }} />
                <input value={outputPer1M} onChange={(e) => setOutputPer1M(e.target.value)} placeholder="out" aria-label="Precio output" style={{ ...inputStyle, width: 70 }} />
                <button onClick={addPrice} disabled={createPrice.isPending} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700 }}>
                  + Añadir
                </button>
              </div>
              <ModelPriceList prices={prices} />
            </Panel>
          )}
        </div>
      </div>
    </Chrome>
  );
}
