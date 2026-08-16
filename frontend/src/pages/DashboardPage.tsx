import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboard";
import { listProjects } from "../api/projects";
import { apiErrorMessage } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { DashboardSummary, Project } from "../types";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardSummary(), listProjects()])
      .then(([s, p]) => {
        setSummary(s);
        setProjects(p);
      })
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  return (
    <>
      <div className="topbar">
        <h2>Dashboard</h2>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {summary && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Active Projects</div>
              <div className="value">{summary.activeProjects}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Test Cases</div>
              <div className="value">{summary.totalTestCases}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "var(--fail)" }}>
              <div className="label">Open Defects</div>
              <div className="value">{summary.openDefects}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "var(--fail)" }}>
              <div className="label">Critical Defects</div>
              <div className="value">{summary.criticalDefects}</div>
            </div>
          </div>
        )}

        {summary && summary.executionSummary.length > 0 && (
          <div className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="section-title">Execution results (all runs)</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {summary.executionSummary.map((row) => (
                <div key={row.status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <StatusBadge status={row.status} />
                  <span className="mono" style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="toolbar">
          <h3 style={{ fontSize: 15 }}>Projects</h3>
          <Link to="/projects" className="btn btn-secondary btn-sm">
            View all
          </Link>
        </div>

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
                    No projects yet. Create one to get started.
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
