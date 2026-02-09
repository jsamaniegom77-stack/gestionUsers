import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
    const { isAuthed } = useAuth();
    return isAuthed ? children : <Navigate to="/login" replace />;
}
