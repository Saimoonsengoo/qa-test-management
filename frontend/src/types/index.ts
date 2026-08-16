export interface Role {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: Role;
}

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  owner?: { id: string; name: string; email: string };
  _count?: { members: number; suites: number; runs?: number; defects?: number };
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectRole: string;
  user: { id: string; name: string; email: string };
}

export type SuiteStatus = "ACTIVE" | "ARCHIVED";

export interface TestSuite {
  id: string;
  projectId: string;
  parentId?: string | null;
  name: string;
  description?: string | null;
  status: SuiteStatus;
  _count?: { testCases: number; children: number };
}

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type TestCaseType = "FUNCTIONAL" | "REGRESSION" | "SMOKE" | "SANITY" | "INTEGRATION" | "UI" | "API" | "SECURITY";
export type TestCaseStatus = "DRAFT" | "REVIEW" | "READY" | "DEPRECATED";

export interface TestStep {
  id?: string;
  stepNumber: number;
  action: string;
  testData?: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  suiteId: string;
  requirementId?: string | null;
  title: string;
  description?: string | null;
  preconditions?: string | null;
  priority: Priority;
  type: TestCaseType;
  status: TestCaseStatus;
  steps?: TestStep[];
  createdAt: string;
  _count?: { steps: number; executions: number };
}

export type TestRunStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface TestRun {
  id: string;
  projectId: string;
  name: string;
  buildVersion?: string | null;
  environment?: string | null;
  status: TestRunStatus;
  createdAt: string;
  _count?: { runCases: number; executions: number };
}

export type ExecutionStatus = "NOT_RUN" | "PASSED" | "FAILED" | "BLOCKED" | "SKIPPED";

export interface TestExecution {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: ExecutionStatus;
  actualResult?: string | null;
  comment?: string | null;
  executedAt?: string | null;
  testCase?: { id: string; title: string; priority?: Priority };
  tester?: { id: string; name: string };
}

export type Severity = "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "TRIVIAL";
export type DefectStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "RETEST" | "CLOSED" | "REOPENED" | "REJECTED";

export interface Defect {
  id: string;
  projectId: string;
  testCaseId?: string | null;
  title: string;
  description: string;
  severity: Severity;
  priority: Priority;
  status: DefectStatus;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  assignee?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string };
  testCase?: { id: string; title: string } | null;
  createdAt: string;
  history?: { id: string; fromStatus?: DefectStatus; toStatus: DefectStatus; changedAt: string; changedBy: { name: string } }[];
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTestCases: number;
  totalExecutions: number;
  openDefects: number;
  criticalDefects: number;
  executionSummary: { status: ExecutionStatus; count: number }[];
  defectSummary: { status: DefectStatus; count: number }[];
}
