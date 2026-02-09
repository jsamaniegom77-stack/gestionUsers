import { useEffect, useState } from "react";
import api from "../api/client";
import Users from "./Users";
import { Settings as SettingsIcon, Users as UsersIcon, Bell, Shield, Database, Globe } from "lucide-react";
import "./Settings.css";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/settings/");
            setSettings(res.data);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "general") {
            loadSettings();
        }
    }, [activeTab]);

    const toggleSetting = async (setting) => {
        try {
            const newValue = !setting.value;
            // Optimistic update
            setSettings(settings.map(s => s.id === setting.id ? { ...s, value: newValue } : s));

            await api.patch(`/api/settings/${setting.id}/`, { value: newValue });
        } catch (error) {
            console.error("Failed to update setting", error);
            // Revert on error
            setSettings(settings.map(s => s.id === setting.id ? { ...s, value: !setting.value } : s));
            alert("No se pudo actualizar la configuración. Intente nuevamente.");
        }
    };

    const navItems = [
        { id: "general", label: "General", icon: <Globe size={18} />, desc: "Configuraciones globales del sistema" },
        { id: "users", label: "Usuarios y Accesos", icon: <UsersIcon size={18} />, desc: "Gestión de roles y permisos" },
        // Placeholder tabs for future expansion
        { id: "security", label: "Seguridad", icon: <Shield size={18} />, desc: "Políticas de contraseñas y MFA" },
        { id: "notifications", label: "Notificaciones", icon: <Bell size={18} />, desc: "Preferencias de alertas" }
    ];

    const activeItem = navItems.find(item => item.id === activeTab);

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
                <h2>Configuración</h2>
                <span>Administre las opciones del sistema y preferencias globales</span>
            </div>

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <div className="settings-sidebar">
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="settings-content-area">
                    <div className="settings-section">
                        <h3>{activeItem?.label}</h3>
                        <p>{activeItem?.desc}</p>

                        <div className="settings-workspace">
                            {activeTab === "users" && (
                                <Users embedded={true} />
                            )}

                            {activeTab === "general" && (
                                <div className="general-settings">
                                    {loading ? (
                                        <p>Cargando configuraciones...</p>
                                    ) : settings.length > 0 ? (
                                        settings.map(s => (
                                            <div key={s.id} className="setting-item">
                                                <div className="setting-info">
                                                    <strong>{s.key}</strong>
                                                    <span>{s.description || "Sin descripción disponible"}</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={s.value}
                                                        onChange={() => toggleSetting(s)}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 8 }}>
                                            <p style={{ margin: 0 }}>No hay configuraciones globales definidas.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Placeholders for other tabs */}
                            {(activeTab === "security" || activeTab === "notifications") && (
                                <div style={{
                                    padding: 60,
                                    textAlign: "center",
                                    background: "#f8fafc",
                                    borderRadius: 12,
                                    border: "2px dashed #e2e8f0"
                                }}>
                                    <h4 style={{ color: "#94a3b8", marginBottom: 8 }}>Próximamente</h4>
                                    <p style={{ margin: 0 }}>Esta sección estará disponible en futuras actualizaciones.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

