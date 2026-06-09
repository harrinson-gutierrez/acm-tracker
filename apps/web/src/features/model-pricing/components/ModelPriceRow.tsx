import { useState } from "react";
import type { ModelPrice } from "@acm/shared";
import { useUpdateModelPrice, useDeleteModelPrice } from "../api/use-model-prices";
import { colors } from "../../../theme/tokens";

const inputStyle = {
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: 6,
  padding: "4px 8px",
  width: 70,
} as const;

const actionStyle = {
  background: "transparent",
  color: colors.muted,
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: "4px 10px",
  cursor: "pointer",
} as const;

const cell = (flex: string, align: "left" | "right" = "left") => ({ flex, textAlign: align } as const);

export function ModelPriceRow({ price }: { price: ModelPrice }) {
  const update = useUpdateModelPrice();
  const deletePrice = useDeleteModelPrice();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(price.inputPer1M));
  const [output, setOutput] = useState(String(price.outputPer1M));

  const save = () => {
    update.mutate(
      { id: price.id, inputPer1M: Number(input) || 0, outputPer1M: Number(output) || 0 },
      { onSuccess: () => setEditing(false) },
    );
  };

  const start = () => {
    setInput(String(price.inputPer1M));
    setOutput(String(price.outputPer1M));
    setEditing(true);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${colors.border}` }}>
      <span style={cell("1")}><span className="mono">{price.model}</span></span>
      <span style={cell("0 0 130px")}><span style={{ color: colors.muted, fontSize: 12 }}>{price.provider}</span></span>
      <span style={cell("0 0 90px", "right")}>
        {editing
          ? <input value={input} onChange={(e) => setInput(e.target.value)} aria-label={`Input ${price.model}`} style={inputStyle} />
          : <span className="mono" style={{ color: colors.green }}>${price.inputPer1M}</span>}
      </span>
      <span style={cell("0 0 90px", "right")}>
        {editing
          ? <input value={output} onChange={(e) => setOutput(e.target.value)} aria-label={`Output ${price.model}`} style={inputStyle} />
          : <span className="mono" style={{ color: colors.green }}>${price.outputPer1M}</span>}
      </span>
      <span style={cell("0 0 150px", "right")}>
        {editing ? (
          <span style={{ display: "inline-flex", gap: 6 }}>
            <button onClick={save} disabled={update.isPending} aria-label={`Guardar ${price.model}`} style={{ ...actionStyle, color: colors.green, borderColor: colors.green }}>Guardar</button>
            <button onClick={() => setEditing(false)} aria-label={`Cancelar ${price.model}`} style={actionStyle}>Cancelar</button>
          </span>
        ) : (
          <span style={{ display: "inline-flex", gap: 6 }}>
            <button onClick={start} aria-label={`Editar ${price.model}`} style={actionStyle}>Editar</button>
            <button onClick={() => deletePrice.mutate(price.id)} aria-label={`Borrar ${price.model}`} style={actionStyle}>Borrar</button>
          </span>
        )}
      </span>
    </div>
  );
}
