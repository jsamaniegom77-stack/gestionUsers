import { useState, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
    User, Mail, Camera, Save, Globe, Linkedin, Instagram, Twitter, MapPin, Briefcase
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState({
        display_name: "",
        bio: "",
        social_links: {},
        avatar: null
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get(`/api/users/?search=${authUser.username}`);
            if (res.data && res.data.length > 0) {
                const userData = res.data.find(u => u.username === authUser.username);
                if (userData) {
                    setUserId(userData.id);
                    setProfile({
                        display_name: userData.display_name || "",
                        bio: userData.bio || "",
                        social_links: userData.social_links || {},
                        avatar: userData.avatar,
                        email: userData.email, // Read only usually
                        date_joined: userData.date_joined,
                        is_staff: userData.is_staff
                    });
                    if (userData.avatar) {
                        setPreview(userData.avatar);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // First update text fields via JSON
            const jsonPayload = {
                profile: {
                    display_name: profile.display_name,
                    bio: profile.bio,
                    social_links: profile.social_links
                }
            };

            await api.patch(`/api/users/${userId}/`, jsonPayload);

            // Then update Avatar via Multipart if changed
            if (avatarFile) {
                const avatarData = new FormData();
                avatarData.append('avatar', avatarFile);
                // Note: Backend must support 'avatar' field at root or handled correctly.
                // If previous logic was tricky, we hope backend serializer handles `profile.avatar` source mapping.
                // Often 'avatar' key in FormData works if Serializer field name is 'avatar'.

                await api.patch(`/api/users/${userId}/`, avatarData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert("¡Perfil actualizado correctamente!");
            loadProfile();

        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Hubo un error al actualizar el perfil.");
        } finally {
            setSaving(false);
        }
    };

    const handleSocialChange = (platform, value) => {
        setProfile({
            ...profile,
            social_links: { ...profile.social_links, [platform]: value }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando perfil...</div>;

    return (
        <div className="profile-container">
            {/* Header Banner */}
            <div className="profile-cover"></div>

            {/* Profile Header Info */}
            <div className="profile-header-content">
                <div className="profile-identity">
                    <div className="profile-avatar-wrapper">
                        {preview ? (
                            <img src={preview} alt="Avatar" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {authUser.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label className="profile-avatar-upload-btn" title="Cambiar Foto">
                            <Camera size={18} />
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                        </label>
                    </div>
                    <div className="profile-titles">
                        <h2>{profile.display_name || authUser.username}</h2>
                        <span>{profile.is_staff ? "Administrador del Sistema" : "Miembro del Equipo"}</span>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        <Save size={18} />
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="profile-body">
                {/* Left Column: Edit Form */}
                <div className="profile-card">
                    <h3><User size={20} /> Información Personal</h3>
                    <form className="form-grid">
                        <div className="form-group">
                            <label>Nombre para Mostrar</label>
                            <input
                                className="form-input"
                                value={profile.display_name}
                                onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                                placeholder="¿Cómo quieres que te llamen?"
                            />
                        </div>

                        <div className="form-group">
                            <label>Biografía</label>
                            <textarea
                                className="form-textarea"
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                rows={4}
                                placeholder="Cuéntanos un poco sobre ti..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Enlaces Sociales</label>
                            <div className="social-links-grid">
                                <div className="social-input-group">
                                    <Twitter size={18} className="social-icon" />
                                    <input
                                        className="form-input social-input"
                                        placeholder="Twitter URL"
                                        value={profile.social_links.twitter || ""}
                                        onChange={e => handleSocialChange("twitter", e.target.value)}
                                    />
                                </div>
                                <div className="social-input-group">
                                    <Linkedin size={18} className="social-icon" />
                                    <input
                                        className="form-input social-input"
                                        placeholder="LinkedIn URL"
                                        value={profile.social_links.linkedin || ""}
                                        onChange={e => handleSocialChange("linkedin", e.target.value)}
                                    />
                                </div>
                                <div className="social-input-group">
                                    <Instagram size={18} className="social-icon" />
                                    <input
                                        className="form-input social-input"
                                        placeholder="Instagram URL"
                                        value={profile.social_links.instagram || ""}
                                        onChange={e => handleSocialChange("instagram", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column: Account Info (Read Only) */}
                <div className="profile-card">
                    <h3><Briefcase size={20} /> Detalles de Cuenta</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre de Usuario</label>
                            <input className="form-input" value={authUser.username} disabled />
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <Mail size={18} style={{ position: "absolute", left: 14, color: "#94a3b8" }} />
                                <input className="form-input" style={{ paddingLeft: 42 }} value={profile.email || ""} disabled />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Miembro Desde</label>
                            <div className="form-input" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "-"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

