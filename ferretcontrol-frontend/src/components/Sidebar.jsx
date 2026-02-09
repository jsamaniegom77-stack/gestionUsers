import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useState, useEffect } from "react";
import api from "../api/client";
import {
    LayoutDashboard,
    Box,
    Database,
    AlertTriangle,
    FileText,
    Shield,
    Settings,
    MessageSquare,
    LogOut,
    Bell
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
    const { logout, user } = useAuth();
    const { unreadCount } = useNotifications();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (user) {
            const loadAvatar = async () => {
                try {
                    const res = await api.get(`/api/users/?search=${user.username}`);
                    if (res.data && res.data.length > 0) {
                        const u = res.data.find(u => u.username === user.username);
                        if (u && u.avatar) setAvatarUrl(u.avatar);
                    }
                } catch (e) { console.error(e); }
            };
            loadAvatar();
        }
    }, [user]);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">❄️</div>
                <div className="sidebar-title">FerretControl</div>
            </div>

            <nav className="sidebar-nav">
                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/")} />
                <NavItem to="/assets" icon={<Box size={20} />} label="Activos" active={isActive("/assets")} />
                <NavItem to="/databases" icon={<Database size={20} />} label="Bases de Datos" active={isActive("/databases")} />
                <NavItem to="/risks" icon={<AlertTriangle size={20} />} label="Riesgos" active={isActive("/risks")} />
                <NavItem to="/audit" icon={<FileText size={20} />} label="Auditoría" active={isActive("/audit")} />
                <NavItem to="/access-control" icon={<Shield size={20} />} label="Control Acceso" active={isActive("/access-control")} />
                <NavItem to="/forum" icon={<MessageSquare size={20} />} label="Foro" active={isActive("/forum")} />
                <NavItem to="/settings" icon={<Settings size={20} />} label="Configuración" active={isActive("/settings")} />

                <div className="nav-divider"></div>

                <Link to="/security-alerts" className={`nav-item ${isActive("/security-alerts") ? "active" : ""}`}>
                    <div className="nav-icon-wrapper">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </div>
                    <span className="nav-label">Alertas</span>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <Link to="/profile" className="user-profile-link">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="User" className="user-avatar" />
                    ) : (
                        <div className="user-avatar-placeholder">{user?.username?.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="user-info">
                        <span className="user-name">{user?.username}</span>
                        <span className="user-role">{user?.is_staff ? "Admin" : "Usuario"}</span>
                    </div>
                </Link>
                <button onClick={logout} className="logout-button" title="Cerrar Sesión">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, active }) {
    return (
        <Link to={to} className={`nav-item ${active ? "active" : ""}`}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
        </Link>
    );
}
