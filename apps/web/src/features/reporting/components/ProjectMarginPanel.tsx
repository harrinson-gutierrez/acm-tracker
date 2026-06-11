import { Panel } from "../../../components/Panel";
import { DonutGauge } from "../../../components/DonutGauge";
import { TileRow } from "../../../components/TileRow";
import { colors } from "../../../theme/tokens";

interface ProjectMarginPanelProps {
  human: number;
  minutes: number;
  estimateHours: number | null;
  estimatedCost: number | null;
  revenue: number | null;
  margin: number | null;
  marginPerHour: number | null;
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const hours = (n: number) => `${Math.round(n * 10) / 10}h`;

export function ProjectMarginPanel(props: ProjectMarginPanelProps) {
  const { human, minutes, estimateHours, estimatedCost, revenue, margin, marginPerHour } = props;
  const realHours = minutes / 60;
  const marginAccent = margin != null && margin < 0 ? colors.coral : colors.green;

  return (
    <Panel title="Margen">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        {margin == null ? (
          <DonutGauge
            segments={[{ value: 1, color: colors.surface2, label: "sin tarifa" }]}
            centerLabel="—"
          />
        ) : (
          <DonutGauge
            segments={marginSegments(margin, human)}
            centerLabel={money(margin)}
          />
        )}
      </div>
      {margin == null ? (
        <div style={{ fontSize: 12, color: colors.dim, textAlign: "center" }}>
          Define la tarifa del proyecto.
        </div>
      ) : (
        <TileRow
          columns={2}
          tiles={[
            { label: "Estimado total", value: estimatedCost != null ? money(estimatedCost) : "—" },
            { label: "Ingreso real", value: revenue != null ? money(revenue) : "—" },
            { label: "Costo real", value: money(human) },
            { label: "Margen", value: money(margin), accent: marginAccent },
            {
              label: "Margen/hora",
              value: marginPerHour != null ? money(marginPerHour) : "—",
              accent: marginAccent,
            },
            {
              label: "Horas est. vs real",
              value: `${estimateHours != null ? hours(estimateHours) : "—"} / ${hours(realHours)}`,
            },
          ]}
        />
      )}
    </Panel>
  );
}

function marginSegments(margin: number, human: number) {
  if (margin < 0) {
    return [{ value: 1, color: colors.coral, label: "pérdida" }];
  }
  return [
    { value: margin, color: colors.green, label: "margen" },
    { value: human, color: colors.surface2, label: "costo" },
  ];
}
