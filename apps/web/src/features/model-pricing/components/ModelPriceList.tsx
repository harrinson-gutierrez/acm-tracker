import type { ModelPrice } from "@acm/shared";
import { ModelPriceRow } from "./ModelPriceRow";
import { colors } from "../../../theme/tokens";

const HEADERS: { label: string; flex: string; align: "left" | "right" }[] = [
  { label: "Modelo", flex: "1", align: "left" },
  { label: "Proveedor", flex: "0 0 130px", align: "left" },
  { label: "Input", flex: "0 0 90px", align: "right" },
  { label: "Output", flex: "0 0 90px", align: "right" },
  { label: "", flex: "0 0 150px", align: "right" },
];

export function ModelPriceList({ prices }: { prices: ModelPrice[] }) {
  return (
    <div>
      <div style={{ display: "flex", padding: "0 0 8px", borderBottom: `1px solid ${colors.border}` }}>
        {HEADERS.map((h, i) => (
          <span key={i} className="mono" style={{ fontSize: 9, letterSpacing: 1, color: colors.dim, flex: h.flex, textAlign: h.align }}>
            {h.label.toUpperCase()}
          </span>
        ))}
      </div>
      {prices.map((p) => <ModelPriceRow key={p.id} price={p} />)}
      {prices.length === 0 && <div style={{ color: colors.muted, fontSize: 13, padding: "12px 0" }}>Sin modelos aún.</div>}
    </div>
  );
}
