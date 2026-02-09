import { useEffect, useState } from "react";
import api from "../api/client";
import { Plus, Search, Edit2, Database, File, Server, Code, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./Assets.css";

export default function Assets() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination (Simple client-side for now)
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
            const url = query ? `/api/assets/?ordering=-created_at&search=${query}` : "/api/assets/?ordering=-created_at";
            const res = await api.get(url);
            setItems(res.data);
            setCurrentPage(1); // Reset page on search
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
                asset_type: item.asset_type,
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
            console.error("Error saving asset", error);
            alert("Error saving asset. Verify fields.");
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className="assets-container">
            {/* Header */}
            <div className="assets-header">
                <div className="assets-title">
                    <h2>Gestión de Activos</h2>
                    <span>Inventario de Información y Sistemas</span>
                </div>
                <div className="assets-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar activos..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="btn-add" onClick={() => openModal()}>
                        <Plus size={18} />
                        Nuevo Activo
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="assets-summary">
                <div className="summary-card">
                    <span className="summary-label">Total Activos</span>
                    <span className="summary-value">{items.length}</span>
                    <span className="summary-sub">Registrados en sistema</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Mayoría Tipo</span>
                    <span className="summary-value" style={{ textTransform: 'capitalize' }}>
                        {(() => {
                            if (items.length === 0) return "-";
                            const counts = items.reduce((acc, i) => { acc[i.asset_type] = (acc[i.asset_type] || 0) + 1; return acc; }, {});
                            return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                        })()}
                    </span>
                    <span className="summary-sub">Clase dominante</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">% Crítico (4-5)</span>
                    <span className="summary-value" style={{ color: "#d32f2f" }}>
                        {items.length > 0
                            ? Math.round((items.filter(i => i.criticality >= 4).length / items.length) * 100) + "%"
                            : "0%"}
                    </span>
                    <span className="summary-sub">Requieren atención alta</span>
                </div>
            </div>

            {/* Content / Table */}
            <div className="assets-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
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
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td><AssetTypeBadge type={item.asset_type} /></td>
                                        <td><ClassificationBadge level={item.classification} /></td>
                                        <td><CriticalityStars level={item.criticality} /></td>
                                        <td style={{ color: "#64748b", fontSize: "0.85em" }}>{item.tags}</td>
                                        <td>{item.owner_username || "-"}</td>
                                        <td>
                                            <button className="action-btn" onClick={() => openModal(item)} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No se encontraron activos.
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
                            <h3>{editingId ? "Editar Activo" : "Registrar Nuevo Activo"}</h3>
                            <button className="btn-close" onClick={closeModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label>Nombre del Activo</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="Ej: Base de Datos Clientes"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Tipo</label>
                                    <select
                                        className="form-input-pro"
                                        value={form.asset_type}
                                        onChange={e => setForm({ ...form, asset_type: e.target.value })}
                                    >
                                        <option value="database">Base de Datos</option>
                                        <option value="dataset">Dataset/Archivo</option>
                                        <option value="api">API / Servicio</option>
                                        <option value="file">Documento Físico/Digital</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Origen (Source)</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.source}
                                        onChange={e => setForm({ ...form, source: e.target.value })}
                                        placeholder="Ej: AWS RDS, Servidor Local..."
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
                                        placeholder="Ej: finanzas, pii, europ"
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>Descripción</label>
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
                                <button type="submit" className="btn-save">Guardar Activo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components for badges
function AssetTypeBadge({ type }) {
    let icon = <Database size={14} />;
    let label = "DB";
    let className = "type-database";

    if (type === 'dataset') { icon = <File size={14} />; label = "Dataset"; className = "type-dataset"; }
    if (type === 'api') { icon = <Server size={14} />; label = "API"; className = "type-api"; }
    if (type === 'file') { icon = <Code size={14} />; label = "File"; className = "type-file"; }

    return (
        <span className={`asset-type-badge ${className}`}>
            {icon} {label}
        </span>
    );
}

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

