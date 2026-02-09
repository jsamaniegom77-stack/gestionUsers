import { useEffect, useState } from "react";
import api from "../api/client";
import { Plus, Search, Edit2, User, Shield, Lock, CheckCircle, XCircle, X, ChevronLeft, ChevronRight, Mail, Clock, Calendar } from "lucide-react";
import "./Users.css";
// Reuse generic table/modal styles from Risks/Assets via CSS importing or duplication 
// (Allocated in Users.css for self-containment)

export default function Users({ embedded = false }) {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, active_users: 0, inactive_users: 0, security_alerts: 0 });
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Less items per page for cleaner look with more data

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        is_staff: false,
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get("/api/users/"),
                api.get("/api/access-control/stats/")
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (user = null) => {
        if (user) {
            setForm({
                username: user.username,
                email: user.email,
                password: "",
                is_staff: user.is_staff,
                is_active: user.is_active,
            });
            setEditingId(user.id);
        } else {
            setForm({
                username: "",
                email: "",
                password: "",
                is_staff: false,
                is_active: true,
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.patch(`/api/users/${editingId}/`, payload);
            } else {
                await api.post("/api/users/", form);
            }
            closeModal();
            await load();
        } catch (error) {
            console.error("Failed to save user", error);
            alert("Error saving user");
        }
    };

    // Helper for time ago
    const timeAgo = (dateString) => {
        if (!dateString) return "Nunca";
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " años";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " días";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min";
        return "Ahora";
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="users-container">
            {/* Header */}
            <div className="users-header">
                {!embedded ? (
                    <div className="users-title">
                        <h2>Control de Accesos</h2>
                        <span>Gestión Avanzada de Usuarios y Seguridad</span>
                    </div>
                ) : (
                    <div></div> /* Spacer to keep actions on right */
                )}

                <div className="users-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar usuarios..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="btn-add" onClick={() => openModal()}>
                        <Plus size={18} />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Stats Cards (Real Data) */}
            {!embedded && (
                <div className="users-summary">
                    <div className="summary-card">
                        <span className="summary-label">Total Usuarios</span>
                        <span className="summary-value">{stats.total_users}</span>
                        <span className="summary-sub">Cuentas registradas</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Activos en 24h</span>
                        <span className="summary-value" style={{ color: "#10b981" }}>
                            {stats.active_users}
                        </span>
                        <span className="summary-sub">Usuarios online recientes</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Inactivos (Sin Login)</span>
                        <span className="summary-value" style={{ color: "#64748b" }}>
                            {stats.inactive_users}
                        </span>
                        <span className="summary-sub">Nunca han accedido</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Alertas Seguridad</span>
                        <span className="summary-value" style={{ color: "#dc2626" }}>
                            {stats.security_alerts}
                        </span>
                        <span className="summary-sub">Riesgos abiertos altos</span>
                    </div>
                </div>
            )}

            {/* Content / Table */}
            <div className="users-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Usuario / Email</th>
                                <th>Estatus</th>
                                <th>Rol / Permisos</th>
                                <th>Último Acceso</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(user => (
                                    <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.6 }}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div className="user-avatar-placeholder" style={{
                                                    background: user.last_login ? '#e0e7ff' : '#f1f5f9',
                                                    color: user.last_login ? '#3730a3' : '#94a3b8'
                                                }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{user.username}</span>
                                                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <Mail size={12} /> {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.is_active ? (
                                                <span className="status-badge" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" }}>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="status-badge" style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {user.is_staff ? (
                                                <span className="role-badge role-admin">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="role-badge role-user">
                                                    <User size={12} /> Usuario
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "#475569" }}>
                                                <Clock size={14} color="#94a3b8" />
                                                {timeAgo(user.last_login)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "#64748b" }}>
                                                <Calendar size={14} color="#94a3b8" />
                                                {new Date(user.date_joined).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="action-btn" onClick={() => openModal(user)} title="Editar Usuario">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No se encontraron usuarios.
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

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
                            <button className="btn-close" onClick={closeModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label>Nombre de Usuario</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        required
                                        placeholder="Ej: jdoe"
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-input-pro"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                        placeholder="ejemplo@empresa.com"
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>{editingId ? "Contraseña (déjalo en blanco para mantener)" : "Contraseña"}</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type="password"
                                            className="form-input-pro"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            required={!editingId}
                                            placeholder="******"
                                        />
                                        <Lock size={16} style={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }} />
                                    </div>
                                </div>

                                <div className="form-field full">
                                    <label>Permisos y Estado</label>
                                    <div className="form-checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.is_staff}
                                                onChange={(e) => setForm({ ...form, is_staff: e.target.checked })}
                                            />
                                            <Shield size={18} color={form.is_staff ? "#4f46e5" : "#94a3b8"} />
                                            <span>Es Administrador (Acceso al Staff)</span>
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            />
                                            <CheckCircle size={18} color={form.is_active ? "#10b981" : "#94a3b8"} />
                                            <span>Usuario Activo (Permitir Login)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-save">{editingId ? "Actualizar" : "Crear Usuario"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

