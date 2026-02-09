import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Risks from "./pages/Risks";
import Audit from "./pages/Audit";
import Users from "./pages/Users";
import AccessControl from "./pages/AccessControl";
import Databases from "./pages/Databases";
import SecurityAlerts from "./pages/SecurityAlerts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Forum from "./pages/Forum";
import Sidebar from "./components/Sidebar"; // New Sidebar

function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar />
      <div style={{
        marginLeft: 250,
        flex: 1,
        padding: "32px",
        overflowY: "auto",
        maxWidth: "calc(100vw - 250px)" // Ensure it doesn't overflow horizontally
      }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout><Dashboard /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/assets"
              element={
                <RequireAuth>
                  <Layout><Assets /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/databases"
              element={
                <RequireAuth>
                  <Layout><Databases /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/risks"
              element={
                <RequireAuth>
                  <Layout><Risks /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/audit"
              element={
                <RequireAuth>
                  <Layout><Audit /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAuth>
                  <Layout><Users /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Layout><Settings /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/access-control"
              element={
                <RequireAuth>
                  <Layout><AccessControl /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/security-alerts"
              element={
                <RequireAuth>
                  <Layout><SecurityAlerts /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Layout><Profile /></Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/forum"
              element={
                <RequireAuth>
                  <Layout><Forum /></Layout>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
