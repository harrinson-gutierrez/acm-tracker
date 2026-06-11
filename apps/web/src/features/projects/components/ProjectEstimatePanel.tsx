import type { ReactNode } from "react";
import { Panel } from "../../../components/Panel";
import { EditableRate } from "../../../components/EditableRate";
import { colors } from "../../../theme/tokens";
import { useUpdateProject } from "../api/use-projects";

interface ProjectEstimatePanelProps {
  projectId: string;
  estimateHours: number | null;
  ratePerHour: number | null;
}

export function ProjectEstimatePanel({ projectId, estimateHours, ratePerHour }: ProjectEstimatePanelProps) {
  const update = useUpdateProject(projectId);

  return (
    <Panel title="Estimación · venta">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Horas estimadas">
          <EditableRate
            label="horas estimadas"
            value={estimateHours ?? 0}
            saving={update.isPending}
            onSave={(estimateHours) => update.mutate({ estimateHours })}
          />
        </Field>
        <Field label="Tarifa de proyecto · USD/h">
          <EditableRate
            label="tarifa de proyecto"
            value={ratePerHour ?? 0}
            saving={update.isPending}
            onSave={(ratePerHour) => update.mutate({ ratePerHour })}
          />
        </Field>
        {ratePerHour == null && (
          <div style={{ fontSize: 11, color: colors.dim }}>
            Define la tarifa del proyecto para calcular el margen.
          </div>
        )}
      </div>
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span className="mono" style={{ fontSize: 11, letterSpacing: 1, color: colors.muted }}>
        {label.toUpperCase()}
      </span>
      {children}
    </div>
  );
}
