import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { createRun, listRuns } from "../api/testRuns";
import { StatusBadge } from "../components/StatusBadge";
import { TestRun } from "../types";

export function TestRunsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [buildVersion, setBuildVersion] = useState("");
  const [environment, setEnvironment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    if (!projectId) return;
    listRuns(projectId).then(setRuns).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [projectId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createRun({ projectId, name, buildVersion: buildVersion || undefined, environment: environment || undefined });
      setName("");
      setBuildVersion("");
      setEnvironment("");
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
        <h2>Test Runs</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New test run"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card card-padded" style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Run name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Build version</label>
                <input className="input mono" value={buildVersion} onChange={(e) => setBuildVersion(e.target.value)} />
              </div>
              <div className="field">
                <label>Environment</label>
                <input className="input" placeholder="staging" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create run"}
            </button>
          </form>
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Run</th>
                <th>Build</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Executions</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No test runs yet.
                  </td>
                </tr>
              )}
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/projects/${projectId}/runs/${r.id}`} style={{ fontWeight: 600 }}>
                      {r.name}
                    </Link>
                  </td>
                  <td className="mono">{r.buildVersion ?? "—"}</td>
                  <td>{r.environment ?? "—"}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="mono">{r._count?.executions ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
