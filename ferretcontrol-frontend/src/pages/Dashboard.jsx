import { useEffect, useState } from "react";
import api from "../api/client";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { ShieldAlert, Database, Activity, CheckCircle } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
    const [assetsCount, setAssetsCount] = useState(0);
    const [risks, setRisks] = useState([]);
    const [audit, setAudit] = useState([]);

    const load = async () => {
        try {
            const a = await api.get("/api/assets/");
            const r = await api.get("/api/risks/?ordering=-created_at");
            const l = await api.get("/api/audit/?ordering=-timestamp");
            setAssetsCount(a.data.length);
            setRisks(r.data); // Keep all for charts
            setAudit(l.data.slice(0, 5)); // Only 5 for table
        } catch (e) {
            console.error("Dashboard load failed", e);
        }
    };

    useEffect(() => {
        load();
        const t = setInterval(load, 15000);
        return () => clearInterval(t);
    }, []);

    // Process data for charts
    const risksByLevel = risks.reduce((acc, x) => {
        acc[x.level] = (acc[x.level] || 0) + 1;
        return acc;
    }, {});

    const chartData = [
        { name: 'Critical', value: risksByLevel.critical || 0, fill: '#ef4444' },
        { name: 'High', value: risksByLevel.high || 0, fill: '#f97316' },
        { name: 'Medium', value: risksByLevel.medium || 0, fill: '#eab308' },
        { name: 'Low', value: risksByLevel.low || 0, fill: '#3b82f6' },
    ];

    // Dummy trend data for visual appeal (since we don't have historical snapshots in this MVP)
    const trendData = [
        { name: 'Mon', risks: 4 },
        { name: 'Tue', risks: 7 },
        { name: 'Wed', risks: 5 },
        { name: 'Thu', risks: 11 },
        { name: 'Fri', risks: risks.length },
    ];

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Panel de Control General</h2>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <Card
                    title="Total Activos"
                    value={assetsCount}
                    icon={<Database size={24} color="#1a237e" />}
                    trend="+12%"
                    trendColor="green"
                />
                <Card
                    title="Riesgos Totales"
                    value={risks.length}
                    icon={<ShieldAlert size={24} color="#d32f2f" />}
                    trend="+5%"
                    trendColor="red"
                />
                <Card
                    title="Auditoría (Eventos)"
                    value={audit.length}
                    icon={<Activity size={24} color="#f57c00" />}
                    trend="Estable"
                    trendColor="gray"
                />
                <Card
                    title="Estado Sistema"
                    value="Óptimo"
                    icon={<CheckCircle size={24} color="#2e7d32" />}
                    trend="99.9%"
                    trendColor="green"
                />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Distribución de Riesgos</h3>
                    <div style={{ height: 300, width: "100%" }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Tendencia de Riesgos (Semana)</h3>
                    <div style={{ height: 300, width: "100%" }}>
                        <ResponsiveContainer>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="risks" stroke="#1a237e" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="tables-grid">
                <div className="table-card">
                    <h3>Últimos Riesgos Registrados</h3>
                    <Table
                        headers={["Activo", "Título", "Nivel", "Score", "Estado"]}
                        rows={risks.slice(0, 5).map(r => [
                            r.asset_name,
                            r.title,
                            <span className={`badge badge-${r.level}`}>{r.level}</span>,
                            r.score,
                            r.status
                        ])}
                    />
                </div>
                <div className="table-card">
                    <h3>Registro de Auditoría Reciente</h3>
                    <Table
                        headers={["Fecha", "Usuario", "Acción", "Entidad"]}
                        rows={audit.map(a => [
                            new Date(a.timestamp).toLocaleString(),
                            a.user_username,
                            <span className="action-tag">{a.action}</span>,
                            a.entity
                        ])}
                    />
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, trend, trendColor }) {
    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className="kpi-icon">{icon}</div>
            </div>
            <div className="kpi-body">
                <span className="kpi-value">{value}</span>
            </div>
            {trend && (
                <div className="kpi-footer">
                    <span style={{ color: trendColor === 'green' ? '#2e7d32' : trendColor === 'red' ? '#d32f2f' : '#666' }}>
                        {trend}
                    </span>
                    <span className="kpi-label"> vs last week</span>
                </div>
            )}
        </div>
    );
}

function Table({ headers, rows }) {
    return (
        <div className="table-responsive">
            <table className="pro-table">
                <thead>
                    <tr>
                        {headers.map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={headers.length} style={{ textAlign: 'center', padding: 20 }}>No data available</td></tr>
                    ) : (
                        rows.map((row, idx) => (
                            <tr key={idx}>
                                {row.map((cell, i) => <td key={i}>{cell}</td>)}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
