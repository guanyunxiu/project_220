import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import WorkDetail from './pages/WorkDetail';
import Reader from './pages/Reader';
import Category from './pages/Category';
import Ranking from './pages/Ranking';
import User from './pages/User';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import WorksAdmin from './pages/admin/Works';
import ChaptersAdmin from './pages/admin/Chapters';
import VolumesAdmin from './pages/admin/Volumes';
import UsersAdmin from './pages/admin/Users';
import CommentsAdmin from './pages/admin/Comments';
import RewardsAdmin from './pages/admin/Rewards';
import SensitiveAdmin from './pages/admin/Sensitive';
import NotificationsAdmin from './pages/admin/Notifications';
import SettingsAdmin from './pages/admin/Settings';
import AuthorWorks from './pages/author/AuthorWorks';
import AuthorChapterEditor from './pages/author/ChapterEditor';
import Earnings from './pages/author/Earnings';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

function RequireAuth({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string[] }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="work/:id" element={<WorkDetail />} />
          <Route path="reader/:workId/:chapterId" element={<Reader />} />
          <Route path="category" element={<Category />} />
          <Route path="category/:id" element={<Category />} />
          <Route path="ranking" element={<Ranking />} />
          <Route
            path="user/*"
            element={
              <RequireAuth>
                <User />
              </RequireAuth>
            }
          />
          <Route
            path="author/*"
            element={
              <RequireAuth requiredRole={['author', 'admin']}>
                <Routes>
                  <Route path="works" element={<AuthorWorks />} />
                  <Route path="works/:id/chapters" element={<AuthorChapterEditor />} />
                  <Route path="earnings" element={<Earnings />} />
                </Routes>
              </RequireAuth>
            }
          />
        </Route>
        <Route
          path="/admin/*"
          element={
            <RequireAuth requiredRole={['admin']}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="works" element={<WorksAdmin />} />
          <Route path="chapters" element={<ChaptersAdmin />} />
          <Route path="volumes" element={<VolumesAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="comments" element={<CommentsAdmin />} />
          <Route path="rewards" element={<RewardsAdmin />} />
          <Route path="sensitive" element={<SensitiveAdmin />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
