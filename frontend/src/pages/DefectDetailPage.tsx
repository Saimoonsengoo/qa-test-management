import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { getDefect, updateDefectStatus } from "../api/defects";
import { StatusBadge } from "../components/StatusBadge";
import { Defect, DefectStatus } from "../types";

// Mirrors ALLOWED_TRANSITIONS in the backend / Defect Workflow.md — kept in
// sync manually since this only drives which buttons are shown, not enforcement.
const ALLOWED_TRANSITIONS: Record<DefectStatus, DefectStatus[]> = {
  NEW: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["RETEST"],
  RETEST: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS"],
  CLOSED: [],
  REJECTED: [],
};

export function DefectDetailPage() {
  const { projectId, defectId } = useParams<{ projectId: string; defectId: string }>();
  const [defect, setDefect] = useState<Defect | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    if (!defectId) return;
    getDefect(defectId).then(setDefect).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [defectId]);

  async function handleTransition(status: DefectStatus) {
    if (!defectId) return;
    try {
      await updateDefectStatus(defectId, status);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (!defect) return <div className="page-content">{error ? <div className="error-banner">{error}</div> : "Loading…"}</div>;

  const nextStates = ALLOWED_TRANSITIONS[defect.status] ?? [];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="breadcrumb">
            <Link to={`/projects/${projectId}/defects`}>Defects</Link> / {defect.title}
          </div>
          <h2>{defect.title}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <StatusBadge status={defect.severity} />
          <StatusBadge status={defect.status} />
        </div>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        <div className="card card-padded" style={{ marginBottom: 16 }}>
          <div className="section-title">Description</div>
          <p style={{ marginBottom: 16 }}>{defect.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="section-title">Steps to reproduce</div>
              <p style={{ whiteSpace: "pre-wrap" }}>{defect.stepsToReproduce}</p>
            </div>
            <div>
              <div className="section-title">Expected vs. actual</div>
              <p><strong>Expected:</strong> {defect.expectedResult}</p>
              <p><strong>Actual:</strong> {defect.actualResult}</p>
            </div>
          </div>
        </div>

        <div className="card card-padded" style={{ marginBottom: 16 }}>
          <div className="section-title">Move status</div>
          {nextStates.length === 0 ? (
            <p style={{ color: "var(--ink-muted)" }}>This is a terminal state — no further transitions.</p>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              {nextStates.map((s) => (
                <button key={s} className="btn btn-secondary btn-sm" onClick={() => handleTransition(s)}>
                  Move to {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-padded" style={{ paddingBottom: 0 }}>
            <div className="section-title">History</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Changed by</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {defect.history?.map((h) => (
                <tr key={h.id}>
                  <td>{h.fromStatus ? <StatusBadge status={h.fromStatus} /> : "—"}</td>
                  <td>
                    <StatusBadge status={h.toStatus} />
                  </td>
                  <td>{h.changedBy.name}</td>
                  <td className="mono">{new Date(h.changedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
