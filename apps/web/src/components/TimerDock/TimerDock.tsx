import { colors } from "../../theme/tokens";

interface TimerDockProps {
  elapsed: string;
  taskTitle: string;
  meta: string;
  onStop: () => void;
  onManual: () => void;
}

export function TimerDock({ elapsed, taskTitle, meta, onStop, onManual }: TimerDockProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, background: colors.surface2, border: `1.5px solid ${colors.coral}`, borderRadius: 12, padding: "16px 24px", marginTop: 16 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color: colors.coral, letterSpacing: 1.5 }}>● EN CURSO</div>
        <div className="mono" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{elapsed}</div>
      </div>
      <div style={{ marginLeft: 12 }}>
        <div style={{ fontWeight: 600 }}>{taskTitle}</div>
        <div className="mono" style={{ fontSize: 12, color: colors.muted }}>{meta}</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <button onClick={onStop} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700 }}>◼ STOP</button>
        <button onClick={onManual} style={{ background: "transparent", color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 20px" }}>+ entrada manual</button>
      </div>
    </div>
  );
}
