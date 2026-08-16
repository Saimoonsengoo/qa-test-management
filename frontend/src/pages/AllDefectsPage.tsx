import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { listProjects } from "../api/projects";
import { listDefects } from "../api/defects";
import { StatusBadge } from "../components/StatusBadge";
import { Defect, Project } from "../types";

export function AllDefectsPage() {
  const [rows, setRows] = useState<(Defect & { projectName: string; projectKey: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProjects()
      .then(async (projects: Project[]) => {
        const perProject = await Promise.all(
          projects.map(async (p) => {
            const defects = await listDefects(p.id, { status: "" });
            return defects
              .filter((d) => !["CLOSED", "REJECTED"].includes(d.status))
              .map((d) => ({ ...d, projectName: p.name, projectKey: p.key }));
          })
        );
        setRows(perProject.flat());
      })
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  return (
    <>
      <div className="topbar">
        <h2>Open Defects — All Projects</h2>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No open defects across any project. 🎉
                  </td>
                </tr>
              )}
              {rows.map((d) => (
                <tr key={d.id}>
                  <td className="id-cell">{d.projectKey}</td>
                  <td>
                    <Link to={`/projects/${d.projectId}/defects/${d.id}`} style={{ fontWeight: 600 }}>
                      {d.title}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={d.severity} />
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
