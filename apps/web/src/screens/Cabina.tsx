import { useTranslation } from "react-i18next";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { RingGauge } from "../components/RingGauge";
import { TileRow } from "../components/TileRow";
import { PersonCostRow } from "../components/PersonCostRow";
import { McpStream } from "../components/McpStream";
import { useTodaySummary, useTeamToday } from "../features/reporting/api/use-today";
import { useIsMobile } from "../lib/use-is-mobile";
import { colors } from "../theme/tokens";

function hm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function Cabina() {
  const { t } = useTranslation();
  const { data: today } = useTodaySummary();
  const { data: team = [] } = useTeamToday();
  const isMobile = useIsMobile();
  const cost = today?.cost ?? 0;
  return (
    <Chrome breadcrumb={t("cabina.breadcrumb")} status={t("cabina.status")}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "560px 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title={t("cabina.burnRatePanel")}>
            <div className="mono" style={{ fontSize: 11, color: colors.dim, marginTop: -6, marginBottom: 8 }}>{t("cabina.dailyTarget")}</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RingGauge total={cost} target={2400} aiFraction={0} caption={t("cabina.ofTarget")} size={isMobile ? 200 : 260} />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, background: colors.coral, borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 12 }}>{t("cabina.human", { cost })}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, background: colors.blue, borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 12 }}>{t("cabina.aiMcp")}</span>
              </span>
            </div>
          </Panel>
          <TileRow
            columns={isMobile ? 2 : 4}
            tiles={[
              { label: t("cabina.today"), value: today ? hm(today.trackedMinutes) : "—", sub: t("cabina.tracked") },
              { label: t("cabina.week"), value: "—", sub: t("cabina.ofForty") },
              { label: t("cabina.billable"), value: today ? hm(today.billableMinutes) : "—", accent: colors.green },
              { label: t("cabina.margin"), value: "—", sub: "Helios", accent: colors.amber },
            ]}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title={t("cabina.teamPanel")}>
            {team.map((p, i) => (
              <PersonCostRow
                key={p.memberId}
                initials={p.initials}
                index={i}
                name={p.name}
                meta={t("cabina.trackedMeta", { time: hm(p.trackedMinutes) })}
                cost={`$${p.cost}`}
              />
            ))}
            {team.length === 0 && <div style={{ color: colors.muted, fontSize: 13 }}>{t("cabina.noActivityToday")}</div>}
          </Panel>
          <Panel title={t("cabina.mcpPanel")}>
            <McpStream rows={[]} emptyLabel={t("cabina.noReports")} />
          </Panel>
        </div>
      </div>
    </Chrome>
  );
}
