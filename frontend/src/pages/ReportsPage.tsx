import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient, apiErrorMessage } from "../api/client";

interface CoverageData {
  totalReadyTestCases: number;
  executedTestCases: number;
  coveragePercent: number;
}

interface DefectSummaryData {
  byStatus: { status: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

export function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [defectSummary, setDefectSummary] = useState<DefectSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      apiClient.get(`/reports/coverage?project_id=${projectId}`),
      apiClient.get(`/reports/defect-summary?project_id=${projectId}`),
    ])
      .then(([cov, def]) => {
        setCoverage(cov.data.data);
        setDefectSummary(def.data.data);
      })
      .catch((err) => setError(apiErrorMessage(err)));
  }, [projectId]);

  return (
    <>
      <div className="topbar">
        <h2>Reports</h2>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        <div className="card card-padded rail rail-accent" style={{ marginBottom: 20 }}>
          <div className="section-title">Test coverage</div>
          <p style={{ color: "var(--ink-muted)", fontSize: 12.5, marginBottom: 12 }}>
            % of Ready test cases with at least one recorded execution.
          </p>
          {coverage ? (
            <>
              <div className="mono" style={{ fontSize: 32, fontWeight: 700 }}>
                {coverage.coveragePercent}%
              </div>
              <div style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>
                {coverage.executedTestCases} of {coverage.totalReadyTestCases} Ready test cases executed
              </div>
            </>
          ) : (
            "Loading…"
          )}
        </div>

        {defectSummary && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card card-padded">
              <div className="section-title">Defects by status</div>
              {defectSummary.byStatus.map((row) => (
                <div key={row.status} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{row.status.replace(/_/g, " ")}</span>
                  <span className="mono">{row.count}</span>
                </div>
              ))}
            </div>
            <div className="card card-padded">
              <div className="section-title">Defects by severity</div>
              {defectSummary.bySeverity.map((row) => (
                <div key={row.severity} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{row.severity}</span>
                  <span className="mono">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
