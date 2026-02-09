import { useEffect, useState } from "react";
import api from "../api/client";
import { Users, UserCheck, UserX, ShieldAlert, BadgeCheck, Clock, Calendar } from "lucide-react";
import "./AccessControl.css";

export default function AccessControl() {
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        security_alerts: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetch for better performance
                const [statsRes, usersRes] = await Promise.all([
                    api.get("/api/access-control/stats/"),
                    api.get("/api/users/")
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Failed to load access control data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const timeAgo = (dateStr) => {
        if (!dateStr) return "Nunca";
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Hace un momento";
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        return date.toLocaleDateString();
    };

    return (
        <div className="access-container">
            {/* Header */}
            <div className="access-header">
                <div className="access-title">
                    <h2>Control de Accesos</h2>
                    <span>Monitoreo de identidad y seguridad de usuarios en tiempo real</span>
                </div>
                <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    <Calendar size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "bottom" }} />
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="access-stats-grid">
                <div className="stat-card stat-blue">
                    <div className="stat-icon"><Users size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total_users}</span>
                        <span className="stat-label">Usuarios Totales</span>
                    </div>
                </div>
                <div className="stat-card stat-green">
                    <div className="stat-icon"><UserCheck size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.active_users}</span>
                        <span className="stat-label">Activos (24h)</span>
                    </div>
                </div>
                <div className="stat-card stat-gray">
                    <div className="stat-icon"><UserX size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.inactive_users}</span>
                        <span className="stat-label">Inactivos</span>
                    </div>
                </div>
                <div className="stat-card stat-red">
                    <div className="stat-icon"><ShieldAlert size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.security_alerts}</span>
                        <span className="stat-label">Alertas Seguridad</span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="access-table-section">
                <div className="table-header">
                    <h3>Directorio y Estado de Usuarios</h3>
                </div>
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Usuario / Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Último Acceso</th>
                                <th>Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>Cargando datos...</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-small">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{u.username}</span>
                                                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {u.is_staff ? (
                                                <span className="badge badge-admin"><ShieldAlert size={12} /> Admin</span>
                                            ) : (
                                                <span className="badge badge-user">Usuario</span>
                                            )}
                                        </td>
                                        <td>
                                            {u.is_active ? (
                                                <span className="badge badge-active">Activo</span>
                                            ) : (
                                                <span className="badge badge-inactive">Deshabilitado</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Clock size={14} color="#64748b" />
                                                <span style={{ color: u.last_login ? "#334155" : "#94a3b8" }}>
                                                    {timeAgo(u.last_login)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: "#64748b" }}>
                                            {new Date(u.date_joined).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

