import { useEffect, useState } from "react";
import api from "../api/client";
import { Plus, Search, Edit2, AlertTriangle, CheckCircle, Activity, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./Risks.css";
// Reusing generic classes from Assets/Databases via css or just relying on similar structure
// Ensuring .form-input-pro classes are available global or I copy them here. 
// For safety, I will rely on the fact that I used specific classes in Risks.css or global if they were there.
// Actually, I should probably copy the form styles to Risks.css or make them global. 
// Since I can't easily make them global right now without editing index.css, I'll assume they are in Risks.css or I'll add them inline/scoped.
// Let's stick to the pattern used in Assets.css. I will add the missing form styles to Risks.css in a follow-up if needed, 
// but for now I will use the same class names assuming the CSS file I just created covers the container/layout 
// and I will add the form styles to Risks.css in the previous step (Wait, I only added container styles).
// I should have added form styles to Risks.css. I will add them in this file content or use inline styles for the form to be safe.
// Actually, better to just include the form styles in Risks.css. 
// I will update Risks.css in a future step or just duplicate the form styles here if I can't edit previous.
// I'll add the form styles to Risks.css in a subsequent call if they are missing.

export default function Risks() {
    const [assets, setAssets] = useState([]);
    const [risks, setRisks] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [form, setForm] = useState({
        asset: "",
        title: "",
        description: "",
        likelihood: 1,
        impact: 1,
        status: "open",
    });

    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        try {
            const a = await api.get("/api/assets/?ordering=-created_at");
            const r = await api.get("/api/risks/?ordering=-created_at");
            setAssets(a.data);
            setRisks(r.data);
            if (!form.asset && a.data[0]) setForm(f => ({ ...f, asset: a.data[0].id }));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredRisks = risks.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.asset_name?.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (item = null) => {
        if (item) {
            setForm({
                asset: item.asset,
                title: item.title,
                description: item.description,
                likelihood: item.likelihood,
                impact: item.impact,
                status: item.status,
            });
            setEditingId(item.id);
        } else {
            setForm({
                asset: assets[0]?.id || "",
                title: "",
                description: "",
                likelihood: 1,
                impact: 1,
                status: "open",
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
                await api.put(`/api/risks/${editingId}/`, form);
            } else {
                await api.post("/api/risks/", form);
            }
            closeModal();
            await load();
        } catch (error) {
            console.error("Error saving risk", error);
            alert("Error saving risk");
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRisks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);

    return (
        <div className="risks-container">
            {/* Header */}
            <div className="risks-header">
                <div className="risks-title">
                    <h2>Gestión de Riesgos</h2>
                    <span>Matriz de Riesgos y Amenazas</span>
                </div>
                <div className="risks-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar riesgos..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="btn-add" onClick={() => openModal()}>
                        <Plus size={18} />
                        Registrar Riesgo
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="risks-summary">
                <div className="summary-card">
                    <span className="summary-label">Total Riesgos</span>
                    <span className="summary-value">{risks.length}</span>
                    <span className="summary-sub">Identificados</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Críticos / Altos</span>
                    <span className="summary-value" style={{ color: "#d32f2f" }}>
                        {risks.filter(r => r.level === 'critical' || r.level === 'high').length}
                    </span>
                    <span className="summary-sub">Prioridad inmediata</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Pendientes</span>
                    <span className="summary-value" style={{ color: "#f59e0b" }}>
                        {risks.filter(r => r.status === 'open' || r.status === 'treating').length}
                    </span>
                    <span className="summary-sub">Abiertos o en Tratamiento</span>
                </div>
            </div>

            {/* Content / Table */}
            <div className="risks-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Activo Afectado</th>
                                <th>Título de Riesgo</th>
                                <th>Probabilidad</th>
                                <th>Impacto</th>
                                <th>Score</th>
                                <th>Nivel</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.asset_name}</td>
                                        <td>{item.title}</td>
                                        <td style={{ textAlign: "center" }}>{item.likelihood}</td>
                                        <td style={{ textAlign: "center" }}>{item.impact}</td>
                                        <td style={{ fontWeight: "bold", textAlign: "center" }}>{item.score}</td>
                                        <td><RiskBadge level={item.level} /></td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td>
                                            <button className="action-btn" onClick={() => openModal(item)} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No se encontraron riesgos.
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
                            <h3>{editingId ? "Editar Riesgo" : "Registrar Nuevo Riesgo"}</h3>
                            <button className="btn-close" onClick={closeModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label>Activo Asociado</label>
                                    <select
                                        className="form-input-pro"
                                        value={form.asset}
                                        onChange={e => setForm({ ...form, asset: Number(e.target.value) })}
                                    >
                                        <option value="">Seleccione un activo...</option>
                                        {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-field full">
                                    <label>Título del Riesgo</label>
                                    <input
                                        className="form-input-pro"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                        placeholder="Ej: Inyección SQL en Login"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Probabilidad (1-5)</label>
                                    <input
                                        type="number"
                                        min="1" max="5"
                                        className="form-input-pro"
                                        value={form.likelihood}
                                        onChange={e => setForm({ ...form, likelihood: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Impacto (1-5)</label>
                                    <input
                                        type="number"
                                        min="1" max="5"
                                        className="form-input-pro"
                                        value={form.impact}
                                        onChange={e => setForm({ ...form, impact: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-field full">
                                    <label>Estado</label>
                                    <select
                                        className="form-input-pro"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="open">Abierto (Open)</option>
                                        <option value="treating">En Tratamiento (Treating)</option>
                                        <option value="closed">Cerrado (Closed)</option>
                                    </select>
                                </div>
                                <div className="form-field full">
                                    <label>Descripción y Mitigación</label>
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
                                <button type="submit" className="btn-save">Guardar Riesgo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function RiskBadge({ level }) {
    const className = `risk-${level}`; // risk-critical, risk-high, etc.
    return <span className={`risk-badge ${className}`}>{level}</span>;
}

function StatusBadge({ status }) {
    const className = `status-${status}`;
    const labels = { open: "Abierto", treating: "Tratando", closed: "Cerrado" };
    return <span className={`status-badge ${className}`}>{labels[status] || status}</span>;
}

