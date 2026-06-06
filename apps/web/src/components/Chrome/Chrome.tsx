import type { CSSProperties, ReactNode } from "react";
import { colors } from "../../theme/tokens";

interface ChromeProps {
  breadcrumb: string;
  children: ReactNode;
}

function Mark({ pos }: { pos: CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 14, height: 14, ...pos }}>
      <div style={{ position: "absolute", width: 14, height: 1, background: colors.coral, opacity: 0.7 }} />
      <div style={{ position: "absolute", width: 1, height: 14, background: colors.coral, opacity: 0.7 }} />
    </div>
  );
}

export function Chrome({ breadcrumb, children }: ChromeProps) {
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", position: "relative", padding: 28 }}>
      <Mark pos={{ top: 14, left: 14 }} />
      <Mark pos={{ top: 14, right: 14 }} />
      <Mark pos={{ bottom: 14, left: 14 }} />
      <Mark pos={{ bottom: 14, right: 14 }} />
      <header
        style={{
          display: "flex",
          alignItems: "center",
          height: 52,
          padding: "0 20px",
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <span className="mono" style={{ color: colors.coral, fontWeight: 700, letterSpacing: 1 }}>
          ◆ ACM-TRACKER
        </span>
        <span className="mono" style={{ color: colors.muted, marginLeft: 24, fontSize: 13 }}>
          {breadcrumb}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: colors.green }} />
          <span className="mono" style={{ color: colors.green, fontSize: 12 }}>LOCAL</span>
        </span>
      </header>
      {children}
    </div>
  );
}
