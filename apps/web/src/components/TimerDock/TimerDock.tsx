import { colors } from "../../theme/tokens";

interface TimerDockProps {
  elapsed: string;
  taskTitle: string;
  meta: string;
  running?: boolean;
  onStop?: () => void;
  onManual: () => void;
  manualLabel?: string;
}

export function TimerDock({ elapsed, taskTitle, meta, running = false, onStop, onManual, manualLabel = "+ entrada manual" }: TimerDockProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, background: colors.surface2, border: `1.5px solid ${colors.coral}`, borderRadius: 12, padding: "16px 24px", marginTop: 16 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color: colors.coral, letterSpacing: 1.5 }}>{running ? "● EN CURSO" : "○ SIN TIMER"}</div>
        <div className="mono" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{elapsed}</div>
      </div>
      <div style={{ marginLeft: 12 }}>
        <div style={{ fontWeight: 600 }}>{taskTitle}</div>
        <div className="mono" style={{ fontSize: 12, color: colors.muted }}>{meta}</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        {running && onStop && (
          <button onClick={onStop} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700 }}>◼ STOP</button>
        )}
        <button onClick={onManual} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700 }}>{manualLabel}</button>
      </div>
    </div>
  );
}
