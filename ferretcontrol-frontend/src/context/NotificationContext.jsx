import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const checkNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get("/api/notifications/unread_count/");
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error("Error checking notifications", error);
        }
    };

    useEffect(() => {
        if (user) {
            checkNotifications();
            const interval = setInterval(checkNotifications, 15000); // Poll every 15s
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    const refreshNotifications = () => {
        checkNotifications();
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
