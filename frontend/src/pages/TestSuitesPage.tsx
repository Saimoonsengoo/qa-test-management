import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { createSuite, listSuites } from "../api/testSuites";
import { TestSuite } from "../types";

export function TestSuitesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    if (!projectId) return;
    listSuites(projectId).then(setSuites).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [projectId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createSuite({ projectId, name, description: description || undefined });
      setName("");
      setDescription("");
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
        <h2>Test Suites</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New suite"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="field">
              <label>Suite name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create suite"}
            </button>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {suites.length === 0 && <div className="empty-state">No test suites yet. Create one to start adding test cases.</div>}
          {suites.map((s) => (
            <Link key={s.id} to={`/projects/${projectId}/suites/${s.id}`} className="card card-padded rail rail-accent">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
              {s.description && (
                <div style={{ color: "var(--ink-muted)", fontSize: 12.5, marginBottom: 8 }}>{s.description}</div>
              )}
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                {s._count?.testCases ?? 0} test cases
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
