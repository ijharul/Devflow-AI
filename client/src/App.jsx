import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

const Home                    = lazy(() => import('./pages/Home'));
const SystemDesign            = lazy(() => import('./pages/SystemDesign'));
const DevOps                  = lazy(() => import('./pages/DevOps'));
const Chat                    = lazy(() => import('./pages/Chat'));
const CodeAnalyzer            = lazy(() => import('./pages/CodeAnalyzer'));
const Login                   = lazy(() => import('./pages/Login'));
const Register                = lazy(() => import('./pages/Register'));
const AuthCallback            = lazy(() => import('./pages/AuthCallback'));
const GitHubRepos             = lazy(() => import('./pages/GitHubRepos'));
const GitHubRepoHub           = lazy(() => import('./pages/GitHubRepoHub'));
const GitHubRepoSystemDesign  = lazy(() => import('./pages/GitHubRepoSystemDesign'));
const GitHubRepoDevOps        = lazy(() => import('./pages/GitHubRepoDevOps'));
const GitHubRepoDeployChat    = lazy(() => import('./pages/GitHubRepoDeployChat'));
const History                 = lazy(() => import('./pages/History'));
const ErrorDebugger           = lazy(() => import('./pages/ErrorDebugger'));
const InterviewMode           = lazy(() => import('./pages/InterviewMode'));
const DiagramEditor           = lazy(() => import('./pages/DiagramEditor'));
const WhatIfSimulator         = lazy(() => import('./pages/WhatIfSimulator'));
const ArchitectureComparison  = lazy(() => import('./pages/ArchitectureComparison'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>
    <span className="spinner" /> Loading…
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      <Navbar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
    </div>
  </div>
);

const P = ({ children }) => (
  <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"          element={user ? <Navigate to="/" replace /> : <Suspense fallback={<PageLoader />}><Login /></Suspense>} />
      <Route path="/register"       element={user ? <Navigate to="/" replace /> : <Suspense fallback={<PageLoader />}><Register /></Suspense>} />
      <Route path="/auth/callback"  element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />
      <Route path="/"               element={<P><Home /></P>} />
      <Route path="/system-design"  element={<P><SystemDesign /></P>} />
      <Route path="/devops"         element={<P><DevOps /></P>} />
      <Route path="/chat"           element={<P><Chat /></P>} />
      <Route path="/code-analyzer"  element={<P><CodeAnalyzer /></P>} />
      <Route path="/github"         element={<P><GitHubRepos /></P>} />
      <Route path="/github/:repoId" element={<P><GitHubRepoHub /></P>} />
      {/* Legacy routes redirect to hub */}
      <Route path="/github/:repoId/system-design" element={<P><GitHubRepoHub /></P>} />
      <Route path="/github/:repoId/devops"        element={<P><GitHubRepoHub /></P>} />
      <Route path="/github/:repoId/deploy-chat"   element={<P><GitHubRepoHub /></P>} />
      <Route path="/history"        element={<P><History /></P>} />
      <Route path="/debug"          element={<P><ErrorDebugger /></P>} />
      <Route path="/interview"      element={<P><InterviewMode /></P>} />
      <Route path="/diagram-editor" element={<P><DiagramEditor /></P>} />
      <Route path="/whatif"         element={<P><WhatIfSimulator /></P>} />
      <Route path="/compare"        element={<P><ArchitectureComparison /></P>} />
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
