import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { createTestCase, listTestCases, updateTestCaseStatus } from "../api/testCases";
import { StatusBadge } from "../components/StatusBadge";
import { Priority, TestCase, TestCaseStatus, TestCaseType, TestStep } from "../types";

const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const TYPES: TestCaseType[] = ["FUNCTIONAL", "REGRESSION", "SMOKE", "SANITY", "INTEGRATION", "UI", "API", "SECURITY"];
const STATUSES: TestCaseStatus[] = ["DRAFT", "REVIEW", "READY", "DEPRECATED"];

// Mirrors Test Case Workflow.md — Draft -> Review -> Ready -> Deprecated.
const NEXT_STATUS: Record<TestCaseStatus, TestCaseStatus | null> = {
  DRAFT: "REVIEW",
  REVIEW: "READY",
  READY: null,
  DEPRECATED: null,
};

function emptyStep(n: number): TestStep {
  return { stepNumber: n, action: "", expectedResult: "" };
}

export function TestCasesPage() {
  const { projectId, suiteId } = useParams<{ projectId: string; suiteId: string }>();
  const [cases, setCases] = useState<TestCase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [requirementId, setRequirementId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [type, setType] = useState<TestCaseType>("FUNCTIONAL");
  const [preconditions, setPreconditions] = useState("");
  const [steps, setSteps] = useState<TestStep[]>([emptyStep(1)]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    if (!suiteId) return;
    listTestCases(suiteId).then(setCases).catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(refresh, [suiteId]);

  function updateStep(index: number, field: keyof TestStep, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!suiteId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createTestCase({
        suiteId,
        title,
        requirementId: requirementId || undefined,
        priority,
        type,
        preconditions: preconditions || undefined,
        steps: steps.filter((s) => s.action.trim() && s.expectedResult.trim()),
      });
      setTitle("");
      setRequirementId("");
      setPreconditions("");
      setSteps([emptyStep(1)]);
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function advanceStatus(tc: TestCase) {
    const next = NEXT_STATUS[tc.status];
    if (!next) return;
    try {
      await updateTestCaseStatus(tc.id, next);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="breadcrumb">
            <Link to={`/projects/${projectId}/suites`}>Test Suites</Link> / Test Cases
          </div>
          <h2>Test Cases</h2>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New test case"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card card-padded" style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Title</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label>Requirement ID</label>
                <input
                  className="input mono"
                  placeholder="FR-013"
                  value={requirementId}
                  onChange={(e) => setRequirementId(e.target.value)}
                />
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
              <div className="field">
                <label>Type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value as TestCaseType)}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Preconditions</label>
              <textarea className="input" rows={2} value={preconditions} onChange={(e) => setPreconditions(e.target.value)} />
            </div>

            <div className="section-title">Steps</div>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr", gap: 10, marginBottom: 8 }}>
                <input
                  className="input"
                  placeholder={`Step ${i + 1} action`}
                  value={step.action}
                  onChange={(e) => updateStep(i, "action", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Test data (optional)"
                  value={step.testData ?? ""}
                  onChange={(e) => updateStep(i, "testData", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Expected result"
                  value={step.expectedResult}
                  onChange={(e) => updateStep(i, "expectedResult", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: 16 }}
              onClick={() => setSteps((prev) => [...prev, emptyStep(prev.length + 1)])}
            >
              + Add step
            </button>

            <div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create test case"}
              </button>
            </div>
          </form>
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Requirement</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Status</th>
                <th>Steps</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No test cases yet.
                  </td>
                </tr>
              )}
              {cases.map((tc) => (
                <tr key={tc.id}>
                  <td style={{ fontWeight: 600 }}>{tc.title}</td>
                  <td className="id-cell">{tc.requirementId ?? "—"}</td>
                  <td>
                    <StatusBadge status={tc.priority} />
                  </td>
                  <td>{tc.type}</td>
                  <td>
                    <StatusBadge status={tc.status} />
                  </td>
                  <td className="mono">{tc._count?.steps ?? 0}</td>
                  <td>
                    {NEXT_STATUS[tc.status] && (
                      <button className="btn btn-secondary btn-sm" onClick={() => advanceStatus(tc)}>
                        Move to {NEXT_STATUS[tc.status]}
                      </button>
                    )}
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
