import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        const res = await api.post("/api/auth/token/", { username, password });
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        setUser({ username });
        return true;
    };

    const logout = async () => {
        try {
            await api.post("/api/auth/logout/");
        } catch (e) {
            console.error("Logout failed", e);
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
    };

    const isAuthed = !!localStorage.getItem("access_token");

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthed }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
