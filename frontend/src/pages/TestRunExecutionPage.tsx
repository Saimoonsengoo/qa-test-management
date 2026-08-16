import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { listSuites } from "../api/testSuites";
import { listTestCases } from "../api/testCases";
import { assignCases, getRun, recordResult } from "../api/testRuns";
import { StatusBadge } from "../components/StatusBadge";
import { ExecutionStatus, TestCase, TestRun, TestSuite } from "../types";

const RESULT_OPTIONS: ExecutionStatus[] = ["PASSED", "FAILED", "BLOCKED", "SKIPPED"];

const RAIL_BY_STATUS: Record<string, string> = {
  PASSED: "rail-pass",
  FAILED: "rail-fail",
  BLOCKED: "rail-blocked",
  NOT_RUN: "",
  SKIPPED: "",
};

export function TestRunExecutionPage() {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();
  const [run, setRun] = useState<(TestRun & { executions: any[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState("");
  const [suiteCases, setSuiteCases] = useState<TestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [savingExecutionId, setSavingExecutionId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  function refresh() {
    if (!runId) return;
    getRun(runId).then(setRun).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [runId]);

  useEffect(() => {
    if (showAssign && projectId) {
      listSuites(projectId).then(setSuites).catch((err) => setError(apiErrorMessage(err)));
    }
  }, [showAssign, projectId]);

  useEffect(() => {
    if (selectedSuiteId) {
      listTestCases(selectedSuiteId).then((cases) => setSuiteCases(cases.filter((c) => c.status === "READY")));
    } else {
      setSuiteCases([]);
    }
  }, [selectedSuiteId]);

  function toggleCase(id: string) {
    setSelectedCaseIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleAssign() {
    if (!runId || selectedCaseIds.length === 0) return;
    try {
      await assignCases(runId, selectedCaseIds);
      setSelectedCaseIds([]);
      setShowAssign(false);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleRecordResult(executionId: string, status: ExecutionStatus) {
    setSavingExecutionId(executionId);
    try {
      await recordResult(executionId, { status, comment: comments[executionId] });
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSavingExecutionId(null);
    }
  }

  if (!run) return <div className="page-content">{error ? <div className="error-banner">{error}</div> : "Loading…"}</div>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="breadcrumb">
            <Link to={`/projects/${projectId}/runs`}>Test Runs</Link> / {run.name}
          </div>
          <h2>{run.name}</h2>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAssign((v) => !v)}>
          {showAssign ? "Cancel" : "Assign test cases"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showAssign && (
          <div className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="field">
              <label>Test suite</label>
              <select className="input" value={selectedSuiteId} onChange={(e) => setSelectedSuiteId(e.target.value)}>
                <option value="">Select a suite…</option>
                {suites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {suiteCases.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {suiteCases.map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <input type="checkbox" checked={selectedCaseIds.includes(c.id)} onChange={() => toggleCase(c.id)} />
                    {c.title}
                  </label>
                ))}
              </div>
            )}
            <button className="btn btn-primary" disabled={selectedCaseIds.length === 0} onClick={handleAssign}>
              Assign {selectedCaseIds.length || ""} test case{selectedCaseIds.length === 1 ? "" : "s"}
            </button>
          </div>
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Test case</th>
                <th>Result</th>
                <th>Comment</th>
                <th>Record</th>
              </tr>
            </thead>
            <tbody>
              {run.executions.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No test cases assigned to this run yet.
                  </td>
                </tr>
              )}
              {run.executions.map((ex) => (
                <tr key={ex.id} className={`rail ${RAIL_BY_STATUS[ex.status] ?? ""}`}>
                  <td style={{ fontWeight: 600 }}>{ex.testCase?.title}</td>
                  <td>
                    <StatusBadge status={ex.status} />
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Optional comment"
                      defaultValue={ex.comment ?? ""}
                      onChange={(e) => setComments((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {RESULT_OPTIONS.map((status) => (
                        <button
                          key={status}
                          className="btn btn-secondary btn-sm"
                          disabled={savingExecutionId === ex.id}
                          onClick={() => handleRecordResult(ex.id, status)}
                        >
                          {status[0]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
