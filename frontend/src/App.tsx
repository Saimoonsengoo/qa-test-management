import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { TestSuitesPage } from "./pages/TestSuitesPage";
import { TestCasesPage } from "./pages/TestCasesPage";
import { TestRunsPage } from "./pages/TestRunsPage";
import { TestRunExecutionPage } from "./pages/TestRunExecutionPage";
import { DefectsPage } from "./pages/DefectsPage";
import { DefectDetailPage } from "./pages/DefectDetailPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AllDefectsPage } from "./pages/AllDefectsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/defects" element={<AllDefectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/suites" element={<TestSuitesPage />} />
          <Route path="/projects/:projectId/suites/:suiteId" element={<TestCasesPage />} />
          <Route path="/projects/:projectId/runs" element={<TestRunsPage />} />
          <Route path="/projects/:projectId/runs/:runId" element={<TestRunExecutionPage />} />
          <Route path="/projects/:projectId/defects" element={<DefectsPage />} />
          <Route path="/projects/:projectId/defects/:defectId" element={<DefectDetailPage />} />
          <Route path="/projects/:projectId/reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
