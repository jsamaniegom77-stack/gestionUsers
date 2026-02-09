import { useEffect, useState } from "react";
import api from "../api/client";
import { Plus, Search, Edit2, Database, ShieldCheck, X, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import "./Databases.css";
// Reuse styles from Assets for consistency where classes match, but import specific CSS for unique overrides

export default function Databases() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [form, setForm] = useState({
        name: "",
        asset_type: "database",
        source: "",
        classification: "internal",
        criticality: 2,
        tags: "",
        description: "",
    });

    const [editingId, setEditingId] = useState(null);

    const load = async (query = "") => {
        try {
            const url = query
                ? `/api/assets/?ordering=-created_at&search=${query}`
                : "/api/assets/?ordering=-created_at";
            const res = await api.get(url);
            // Filter strictly for databases
            setItems(res.data.filter(i => i.asset_type === "database"));
            setCurrentPage(1);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        load(e.target.value);
    };

    const openModal = (item = null) => {
        if (item) {
            setForm({
                name: item.name,
                asset_type: "database",
                source: item.source,
                classification: item.classification,
                criticality: item.criticality,
                tags: item.tags,
                description: item.description,
            });
            setEditingId(item.id);
        } else {
            setForm({
                name: "",
                asset_type: "database",
                source: "",
                classification: "internal",
                criticality: 2,
                tags: "",
                description: "",
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
                await api.put(`/api/assets/${editingId}/`, form);
            } else {
                await api.post("/api/assets/", form);
            }
            closeModal();
            await load(search);
        } catch (error) {
            console.error("Error saving database", error);
            alert("Error saving database");
        }
    };

    const downloadAuthorship = async (id, name) => {
        try {
            const res = await api.get(`/api/assets/${id}/download_authorship/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `authorship_${name.replace(/\s+/g, '_')}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download authorship certificate");
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className="databases-container">
            {/* Header */}
            <div className="databases-header">
                <div className="databases-title">
                    <h2>Gestión de Bases de Datos</h2>
                    <span>Repositorios y Fuentes de Datos Críticas</span>
                </div>
                <div className="databases-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar bases de datos..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="btn-add" onClick={() => openModal()}>
                        <Plus size={18} />
                        Nueva Base de Datos
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="databases-summary">
                <div className="summary-card">
                    <span className="summary-label">Total DBs</span>
                    <span className="summary-value">{items.length}</span>
                    <span className="summary-sub">Registradas</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Confidenciales</span>
                    <span className="summary-value" style={{ color: "#f59e0b" }}>
                        {items.filter(i => i.classification === 'confidential' || i.classification === 'restricted').length}
                    </span>
                    <span className="summary-sub">Datos sensibles</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Alta Criticidad</span>
                    <span className="summary-value" style={{ color: "#d32f2f" }}>
                        {items.filter(i => i.criticality >= 4).length}
                    </span>
                    <span className="summary-sub">Nivel 4 o 5</span>
                </div>
            </div>

            {/* Content / Table */}
            <div className="databases-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fuente / Conexión</th>
                                <th>Clasificación</th>
                                <th>Criticidad</th>
                                <th>Tags</th>
                                <th>Propietario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                            <Database size={16} color="#4f46e5" />
                                            {item.name}
                                        </td>
                                        <td>
                                            {item.source ? <span className="db-source-badge">{item.source}</span> : <span style={{ color: "#ccc" }}>-</span>}
                                        </td>
                                        <td><ClassificationBadge level={item.classification} /></td>
                                        <td><CriticalityStars level={item.criticality} /></td>
                                        <td style={{ color: "#64748b", fontSize: "0.85em" }}>{item.tags}</td>
                                        <td>{item.owner_username || "-"}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button className="action-btn" onClick={() => openModal(item)} title="Editar">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn-download" onClick={() => downloadAuthorship(item.id, item.name)} title="Descargar Certificado de Autoría">
                                                    <FileText size={14} /> Certificado
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No se encontraron bases de datos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 10 }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="action-btn"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span style={{ display: "flex", alignItems: "center", color: "#64748b" }}>
                            Página {currentPage} de {totalPages}
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
                            <h3>{editingId ? "Editar Base de Datos" : "Registrar Base de Datos"}</h3>
                            <button className="btn-close" onClick={closeModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label>Nombre de la Base de Datos</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="Ej: DW_Ventas_Prod"
                                    />
                                </div>

                                {/* Hidden/Fixed Type */}
                                <div className="form-field">
                                    <label>Tipo de Activo</label>
                                    <div className="form-input-pro" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                        Base de Datos
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Fuente / Connection String Info</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.source}
                                        onChange={e => setForm({ ...form, source: e.target.value })}
                                        placeholder="Ej: 192.168.1.50:5432"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Clasificación</label>
                                    <select
                                        className="form-input-pro"
                                        value={form.classification}
                                        onChange={e => setForm({ ...form, classification: e.target.value })}
                                    >
                                        <option value="public">Pública</option>
                                        <option value="internal">Interna</option>
                                        <option value="confidential">Confidencial</option>
                                        <option value="restricted">Restringida</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Criticidad (1-5)</label>
                                    <input
                                        type="number"
                                        min="1" max="5"
                                        className="form-input-pro"
                                        value={form.criticality}
                                        onChange={e => setForm({ ...form, criticality: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>Tags (separados por coma)</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.tags}
                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                        placeholder="Ej: financiero, clientes, produccion"
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>Descripción y Esquema</label>
                                    <textarea
                                        className="form-input-pro"
                                        rows="3"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-save">Guardar Base de Datos</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Reuse badges from Assets logic (copied for independence or could be shared component)
function ClassificationBadge({ level }) {
    const colors = {
        public: "#3b82f6",
        internal: "#10b981",
        confidential: "#f59e0b",
        restricted: "#ef4444"
    };
    return <span style={{ color: colors[level] || "#666", fontWeight: 600, textTransform: "capitalize" }}>{level}</span>;
}

function CriticalityStars({ level }) {
    return (
        <div style={{ display: "flex" }}>
            {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                    width: 8, height: 8,
                    borderRadius: "50%",
                    background: i < level ? "#1a237e" : "#e2e8f0",
                    marginRight: 2
                }} />
            ))}
        </div>
    );
}

