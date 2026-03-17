import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/AuthPage";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import RetoursPage from "@/pages/RetoursPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      <Route element={user ? <DashboardLayout /> : <Navigate to="/auth" />}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/retours" element={<RetoursPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
