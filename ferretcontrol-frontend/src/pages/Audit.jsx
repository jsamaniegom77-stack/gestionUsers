import { useEffect, useState } from "react";
import api from "../api/client";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import "./Audit.css";

// Reuse generic styles where possible, specific overrides in Audit.css

export default function Audit() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const load = async (query = "") => {
        try {
            const url = query ? `/api/audit/?ordering=-timestamp&search=${query}` : "/api/audit/?ordering=-timestamp";
            const res = await api.get(url);
            setItems(res.data);
            setCurrentPage(1);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        // Basic client-side search if API doesn't support generic search well yet, 
        // or re-fetch. Since backend has search, let's use client filter for now for speed on small data
        // For large data, we should debounce and hit API. 
        // Given complexity, let's do client side filtering on the already fetched list for immediate feedback
        // assuming list isn't huge yet.
    };

    const filteredItems = items.filter(i =>
        (i.user_username && i.user_username.toLowerCase().includes(search.toLowerCase())) ||
        (i.action && i.action.toLowerCase().includes(search.toLowerCase())) ||
        (i.entity && i.entity.toLowerCase().includes(search.toLowerCase()))
    );

    // Chart Data Processing
    // 1. Actions by Type (Method/Action)
    const actionsCount = filteredItems.reduce((acc, item) => {
        const action = item.action || "UNKNOWN";
        acc[action] = (acc[action] || 0) + 1;
        return acc;
    }, {});

    const actionChartData = Object.keys(actionsCount).map(key => ({
        name: key,
        value: actionsCount[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 actions

    // 2. Activity by User
    const userCount = filteredItems.reduce((acc, item) => {
        const user = item.user_username || "System/Anon";
        acc[user] = (acc[user] || 0) + 1;
        return acc;
    }, {});

    const userChartData = Object.keys(userCount).map(key => ({
        name: key,
        value: userCount[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 users

    const COLORS = ['#1a237e', '#0d47a1', '#1565c0', '#1976d2', '#42a5f5', '#90caf9'];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="audit-container">
            {/* Header */}
            <div className="audit-header">
                <div className="audit-title">
                    <h2>Registro de Auditoría</h2>
                    <span>Traza de Actividades y Eventos del Sistema</span>
                </div>
                <div className="audit-actions">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
                            placeholder="Buscar logs..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="btn-add" onClick={() => load(search)} title="Refrescar">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Visual Charts Summary */}
            <div className="audit-charts-section">
                <div className="chart-wrapper">
                    <h3>Top Acciones Realizadas</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={actionChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#1a237e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="chart-wrapper">
                    <h3>Actividad por Usuario</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={userChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="audit-content">
                <div className="table-responsive">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Entidad</th>
                                <th>Ruta (Path)</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontSize: "0.9em", color: "#64748b" }}>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{item.user_username || "System"}</td>
                                        <td>
                                            <span className="method-badge">{item.action}</span>
                                        </td>
                                        <td>{item.entity}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.85em", color: "#475569" }}>
                                            {item.path}
                                        </td>
                                        <td>
                                            {item.success ? (
                                                <span className="status-success">Éxito</span>
                                            ) : (
                                                <span className="status-failure">Error</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                                        No se encontraron registros.
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
        </div>
    );
}

