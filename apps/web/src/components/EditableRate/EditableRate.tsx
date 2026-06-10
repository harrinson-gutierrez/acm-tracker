import { useState } from "react";
import { colors, radius } from "../../theme/tokens";

interface EditableRateProps {
  value: number;
  label: string;
  saving?: boolean;
  onSave: (next: number) => void;
}

function parseRate(raw: string): number | null {
  const n = Number(raw);
  if (raw.trim() === "" || Number.isNaN(n) || n < 0) return null;
  return n;
}

export function EditableRate({ value, label, saving = false, onSave }: EditableRateProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const open = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    const next = parseRate(draft);
    setEditing(false);
    if (next !== null && next !== value) onSave(next);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={`Editar tarifa de ${label}`}
        className="mono"
        style={{
          background: "transparent",
          border: "none",
          color: saving ? colors.amber : colors.text,
          cursor: "pointer",
          font: "inherit",
          padding: 0,
        }}
      >
        ${value.toFixed(2)}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      min={0}
      step={0.5}
      value={draft}
      aria-label={`Tarifa de ${label}`}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      className="mono"
      style={{
        width: 80,
        textAlign: "right",
        background: colors.surface2,
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: radius.sm,
        color: colors.text,
        padding: "4px 8px",
        font: "inherit",
      }}
    />
  );
}
