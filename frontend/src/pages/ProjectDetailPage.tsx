import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { getProject } from "../api/projects";
import { StatusBadge } from "../components/StatusBadge";
import { Project, ProjectMember } from "../types";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<(Project & { members: ProjectMember[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then(setProject).catch((err) => setError(apiErrorMessage(err)));
  }, [projectId]);

  if (error) return <div className="page-content"><div className="error-banner">{error}</div></div>;
  if (!project) return <div className="page-content">Loading…</div>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="breadcrumb">
            <Link to="/projects">Projects</Link> / <span className="mono">{project.key}</span>
          </div>
          <h2>{project.name}</h2>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="page-content">
        {project.description && (
          <p style={{ color: "var(--ink-muted)", marginBottom: 20 }}>{project.description}</p>
        )}

        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Test Suites</div>
            <div className="value">{project._count?.suites ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="label">Test Runs</div>
            <div className="value">{project._count?.runs ?? 0}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "var(--fail)" }}>
            <div className="label">Defects</div>
            <div className="value">{project._count?.defects ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="label">Members</div>
            <div className="value">{project.members.length}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          <Link to={`/projects/${project.id}/suites`} className="card card-padded rail rail-accent">
            <div className="section-title" style={{ marginBottom: 4 }}>Go to</div>
            <div style={{ fontWeight: 600 }}>Test Suites &amp; Cases</div>
          </Link>
          <Link to={`/projects/${project.id}/runs`} className="card card-padded rail rail-accent">
            <div className="section-title" style={{ marginBottom: 4 }}>Go to</div>
            <div style={{ fontWeight: 600 }}>Test Runs</div>
          </Link>
          <Link to={`/projects/${project.id}/defects`} className="card card-padded rail rail-fail">
            <div className="section-title" style={{ marginBottom: 4 }}>Go to</div>
            <div style={{ fontWeight: 600 }}>Defects</div>
          </Link>
        </div>

        <div className="section-title">Members</div>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Project Role</th>
              </tr>
            </thead>
            <tbody>
              {project.members.map((m) => (
                <tr key={m.id}>
                  <td>{m.user.name}</td>
                  <td className="id-cell">{m.user.email}</td>
                  <td>{m.projectRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
