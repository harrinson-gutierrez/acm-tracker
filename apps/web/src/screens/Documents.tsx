import { useState } from "react";
import { Chrome } from "../components/Chrome";
import { Panel } from "../components/Panel";
import { SideNav } from "../components/SideNav";
import { DataTable } from "../components/DataTable";
import { Tag } from "../components/Tag";
import { useDocuments, useCreateDocument } from "../features/documents/api/use-documents";
import { colors } from "../theme/tokens";

const KIND_ICON: Record<string, string> = { page: "▤", file: "⎙", link: "⇲" };
const KIND_COLOR: Record<string, string> = { page: colors.coral, file: colors.green, link: colors.blue };
const PHASES = ["Ventas", "Kickoff", "Cotización", "Prototipo", "Validación", "Ejecución", "Entrega"];

export function Documents() {
  const { data: docs = [] } = useDocuments();
  const createDoc = useCreateDocument();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!title.trim()) return;
    createDoc.mutate(
      { kind: url.trim() ? "link" : "page", title: title.trim(), url: url.trim() || undefined },
      { onSuccess: () => { setTitle(""); setUrl(""); } },
    );
  };

  return (
    <Chrome breadcrumb="/ documentos">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start" }}>
        <SideNav
          title="Espacios"
          items={[{ label: "Todos los docs", active: true }, { label: "Por proyecto" }, { label: "Sin proyecto" }, ...PHASES.map((p) => ({ label: p }))]}
        />
        <Panel title={`Documentos · ${docs.length}`}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del documento…" aria-label="Título"
              style={{ flex: 2, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.text, borderRadius: 8, padding: "10px 12px" }} />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opcional → enlace)" aria-label="URL"
              style={{ flex: 2, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.text, borderRadius: 8, padding: "10px 12px" }} />
            <button onClick={add} disabled={createDoc.isPending} style={{ background: colors.coral, color: colors.bg, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700 }}>
              + Nuevo
            </button>
          </div>
          <DataTable
            columns={[
              { key: "doc", label: "Documento" },
              { key: "phase", label: "Fase", width: 130 },
              { key: "by", label: "Por", width: 120 },
              { key: "date", label: "Creado", width: 110, align: "right" },
            ]}
            rows={docs.map((d) => ({
              id: d.id,
              cells: {
                doc: (
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ color: KIND_COLOR[d.kind] }}>{KIND_ICON[d.kind]}</span>
                    <span style={{ fontWeight: 600 }}>{d.title}</span>
                    <span className="mono" style={{ fontSize: 10, color: colors.dim }}>{d.kind.toUpperCase()}</span>
                  </span>
                ),
                phase: d.phase ? <Tag label={d.phase} color={colors.amber} /> : <span style={{ color: colors.dim }}>—</span>,
                by: <span style={{ color: colors.muted, fontSize: 12 }}>{d.createdBy ?? "—"}</span>,
                date: <span className="mono" style={{ fontSize: 11, color: colors.dim }}>{d.createdAt.slice(0, 10)}</span>,
              },
            }))}
            emptyLabel="Sin documentos. Crea el primero arriba."
          />
        </Panel>
      </div>
    </Chrome>
  );
}
