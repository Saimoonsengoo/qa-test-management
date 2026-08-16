// Central mapping from every status enum in the system to a signal color.
// Keep in sync with the workflow docs (Test Case Workflow.md, Defect Workflow.md).
const STATUS_STYLE: Record<string, { cls: string; label?: string }> = {
  // Test case status
  DRAFT: { cls: "badge-neutral" },
  REVIEW: { cls: "badge-blocked" },
  READY: { cls: "badge-pass" },
  DEPRECATED: { cls: "badge-neutral" },
  // Execution status
  NOT_RUN: { cls: "badge-neutral", label: "NOT RUN" },
  PASSED: { cls: "badge-pass" },
  FAILED: { cls: "badge-fail" },
  BLOCKED: { cls: "badge-blocked" },
  SKIPPED: { cls: "badge-neutral" },
  // Defect status
  NEW: { cls: "badge-accent" },
  ASSIGNED: { cls: "badge-accent" },
  IN_PROGRESS: { cls: "badge-blocked", label: "IN PROGRESS" },
  RESOLVED: { cls: "badge-pass" },
  RETEST: { cls: "badge-blocked" },
  CLOSED: { cls: "badge-pass" },
  REOPENED: { cls: "badge-fail" },
  REJECTED: { cls: "badge-neutral" },
  // Priority / severity (reuse fail/blocked/neutral as a rough urgency scale)
  CRITICAL: { cls: "badge-fail" },
  BLOCKER: { cls: "badge-fail" },
  MAJOR: { cls: "badge-blocked" },
  HIGH: { cls: "badge-blocked" },
  MEDIUM: { cls: "badge-accent" },
  MINOR: { cls: "badge-neutral" },
  LOW: { cls: "badge-neutral" },
  TRIVIAL: { cls: "badge-neutral" },
  // Project / suite / run status
  ACTIVE: { cls: "badge-pass" },
  PLANNING: { cls: "badge-accent" },
  ON_HOLD: { cls: "badge-blocked", label: "ON HOLD" },
  COMPLETED: { cls: "badge-pass" },
  ARCHIVED: { cls: "badge-neutral" },
  NOT_STARTED: { cls: "badge-neutral", label: "NOT STARTED" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? { cls: "badge-neutral" };
  return (
    <span className={`badge ${style.cls}`}>
      <span className="badge-dot" />
      {(style.label ?? status).replace(/_/g, " ")}
    </span>
  );
}
