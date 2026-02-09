import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useState, useEffect } from "react";
import api from "../api/client";

export default function Nav() {
    const { logout, user } = useAuth();
    const { unreadCount } = useNotifications();
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Load user avatar slightly hacky separate load or rely on context if context carried more info
    useEffect(() => {
        if (user) {
            const loadAvatar = async () => {
                try {
                    const res = await api.get(`/api/users/?search=${user.username}`);
                    if (res.data && res.data.length > 0) {
                        const u = res.data.find(u => u.username === user.username);
                        if (u && u.avatar) setAvatarUrl(u.avatar);
                    }
                } catch (e) { console.error(e); }
            };
            loadAvatar();
        }
    }, [user]);

    return (
        <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd", alignItems: "center" }}>
            <Link to="/">Dashboard</Link>
            <Link to="/assets">Assets</Link>
            <Link to="/databases">Databases</Link>
            <Link to="/risks">Risks</Link>
            <Link to="/audit">Audit</Link>
            <Link to="/access-control">Access Control</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/forum">Foro / Mensajes</Link>

            <Link to="/security-alerts" style={{ position: "relative", textDecoration: "none", fontSize: "1.2em", marginLeft: "auto", marginRight: 10 }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: -5,
                        right: -10,
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: "0.7em"
                    }}>
                        {unreadCount}
                    </span>
                )}
            </Link>

            <Link to="/profile" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "black", gap: 8, marginRight: 10 }}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="me" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>Yo</div>
                )}
                <span>{user?.username}</span>
            </Link>

            <button onClick={logout}>Logout</button>
        </div>
    );
}
