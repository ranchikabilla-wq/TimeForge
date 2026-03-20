import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/layout/ToastContainer';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const Home = lazy(() => import('@/pages/Home'));
const Generator = lazy(() => import('@/pages/Generator'));
const TimetableView = lazy(() => import('@/pages/TimetableView'));
const SavedTimetables = lazy(() => import('@/pages/SavedTimetables'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm font-body">Initializing forge...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('timeforge-auth') === 'true';
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const isPublicPage = location.pathname === '/login' || location.pathname === '/landing' || location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isPublicPage && <Header />}
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/generator" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><TimetableView /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedTimetables /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <ToastContainer />
    </div>
  );
}
