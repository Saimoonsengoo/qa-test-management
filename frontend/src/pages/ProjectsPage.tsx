import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { createProject, listProjects } from "../api/projects";
import { StatusBadge } from "../components/StatusBadge";
import { Project } from "../types";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listProjects().then(setProjects).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createProject({ name, key: key.toUpperCase(), description: description || undefined });
      setName("");
      setKey("");
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
        <h2>Projects</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="section-title">New project</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Key (e.g. OAX)</label>
                <input
                  className="input mono"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create project"}
            </button>
          </form>
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Project</th>
                <th>Status</th>
                <th>Suites</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No projects yet.
                  </td>
                </tr>
              )}
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="id-cell">{p.key}</td>
                  <td>
                    <Link to={`/projects/${p.id}`} style={{ fontWeight: 600 }}>
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{p._count?.suites ?? 0}</td>
                  <td>{p._count?.members ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
