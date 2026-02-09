import { useEffect, useState } from "react";
import api from "../api/client";
import { useNotifications } from "../context/NotificationContext";
import {
    Bell, CheckCheck, AlertTriangle, ShieldAlert, Info, Search, ChevronLeft, ChevronRight, Clock, MapPin, Eye
} from "lucide-react";
import "./SecurityAlerts.css";

export default function SecurityAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [search, setSearch] = useState("");
    const { refreshNotifications } = useNotifications();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadAlerts = async () => {
        try {
            const res = await api.get("/api/notifications/?ordering=-created_at");
            setAlerts(res.data);
        } catch (error) {
            console.error("Error loading alerts", error);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const markAllRead = async () => {
        try {
            await api.post("/api/notifications/mark_all_read/");
            loadAlerts(); // Refresh list to update UI
            refreshNotifications(); // Update sidebar/context count
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.post(`/api/notifications/${id}/mark_read/`);
            setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
            refreshNotifications();
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    // Filter Stats
    const totalAlerts = alerts.length;
    const unreadAlerts = alerts.filter(a => !a.is_read).length;
    const criticalAlerts = alerts.filter(a => a.alert_type === 'CONCURRENT_LOGIN' || a.alert_type === 'BRUTE_FORCE').length; // Assuming types
    // Note: Adjust critical logic based on backend types actually returned

    const filteredAlerts = alerts.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase()) ||
        (a.ip_address && a.ip_address.includes(search))
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

    const getBadge = (type) => {
        switch (type) {
            case 'CONCURRENT_LOGIN':
            case 'BRUTE_FORCE':
                return <span className="alert-type-badge alert-critical"><ShieldAlert size={12} /> CRÍTICO</span>;
            case 'FORUM_POST':
                return <span className="alert-type-badge alert-info"><Info size={12} /> INFO</span>;
            default:
                return <span className="alert-type-badge alert-warning"><AlertTriangle size={12} /> ALERTA</span>;
        }
    };

    return (
        <div className="alerts-container">
            {/* Header */}
            <div className="alerts-header">
                <div className="alerts-title">
                    <h2>Centro de Notificaciones</h2>
                    <span>Alertas de Seguridad y Actividad del Sistema</span>
                </div>
                <div className="alerts-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar alertas..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    {unreadAlerts > 0 && (
                        <button className="btn-mark-all" onClick={markAllRead}>
                            <CheckCheck size={16} />
                            Marcar todo leído
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="alerts-summary">
                <div className="summary-card">
                    <span className="summary-label">Total Notificaciones</span>
                    <span className="summary-value">{totalAlerts}</span>
                    <span className="summary-sub">Histórico completo</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Nuevas / No Leídas</span>
                    <span className="summary-value" style={{ color: "#2563eb" }}>
                        {unreadAlerts}
                    </span>
                    <span className="summary-sub">Requieren atención</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Críticas</span>
                    <span className="summary-value" style={{ color: "#dc2626" }}>
                        {criticalAlerts}
                    </span>
                    <span className="summary-sub">Alta importancia</span>
                </div>
            </div>

            {/* Table */}
            <div className="alerts-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Mensaje / Detalle</th>
                                <th>Origen (IP)</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(alert => (
                                    <tr key={alert.id} style={{ background: alert.is_read ? 'white' : '#f0f9ff' }}>
                                        <td>{getBadge(alert.alert_type)}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: 600, color: "#1e293b" }}>{alert.title}</span>
                                                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{alert.message}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {alert.ip_address ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.9rem" }}>
                                                    <MapPin size={14} /> {alert.ip_address}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#94a3b8" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "0.9rem" }}>
                                                <Clock size={14} />
                                                {new Date(alert.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            {alert.is_read ? (
                                                <span className="status-read">Leído</span>
                                            ) : (
                                                <span className="status-unread">Nuevo</span>
                                            )}
                                        </td>
                                        <td>
                                            {!alert.is_read && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleMarkRead(alert.id)}
                                                    title="Marcar como leída"
                                                >
                                                    <Eye size={16} color="#2563eb" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No hay notificaciones que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 12 }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="action-btn"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span style={{ display: "flex", alignItems: "center", color: "#64748b", fontWeight: 500 }}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="action-btn"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

