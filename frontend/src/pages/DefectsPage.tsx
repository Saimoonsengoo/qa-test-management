import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { createDefect, listDefects } from "../api/defects";
import { StatusBadge } from "../components/StatusBadge";
import { Defect, Priority, Severity } from "../types";

const SEVERITIES: Severity[] = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"];
const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const RAIL_BY_SEVERITY: Record<Severity, string> = {
  BLOCKER: "rail-fail",
  CRITICAL: "rail-fail",
  MAJOR: "rail-blocked",
  MINOR: "",
  TRIVIAL: "",
};

export function DefectsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("MAJOR");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    if (!projectId) return;
    listDefects(projectId, statusFilter ? { status: statusFilter } : {})
      .then(setDefects)
      .catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [projectId, statusFilter]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createDefect({
        projectId,
        title,
        description,
        severity,
        priority,
        stepsToReproduce,
        expectedResult,
        actualResult,
      });
      setTitle("");
      setDescription("");
      setStepsToReproduce("");
      setExpectedResult("");
      setActualResult("");
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <h2>Defects</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Report defect"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="field">
              <label>Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Severity</label>
                <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Priority</label>
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Steps to reproduce</label>
              <textarea className="input" rows={3} value={stepsToReproduce} onChange={(e) => setStepsToReproduce(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Expected result</label>
                <textarea className="input" rows={2} value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} required />
              </div>
              <div className="field">
                <label>Actual result</label>
                <textarea className="input" rows={2} value={actualResult} onChange={(e) => setActualResult(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Reporting…" : "Report defect"}
            </button>
          </form>
        )}

        <div className="toolbar">
          <div className="filters">
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "RETEST", "CLOSED", "REOPENED", "REJECTED"].map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {defects.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No defects found.
                  </td>
                </tr>
              )}
              {defects.map((d) => (
                <tr key={d.id} className={`rail ${RAIL_BY_SEVERITY[d.severity]}`}>
                  <td>
                    <Link to={`/projects/${projectId}/defects/${d.id}`} style={{ fontWeight: 600 }}>
                      {d.title}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={d.severity} />
                  </td>
                  <td>
                    <StatusBadge status={d.priority} />
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td>{d.assignee?.name ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
