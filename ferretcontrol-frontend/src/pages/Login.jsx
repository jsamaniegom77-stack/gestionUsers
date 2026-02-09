import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Login.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const { login } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await login(username, password);
            nav("/");
        } catch {
            setErr("Credenciales inválidas o sistema no disponible.");
        }
    };

    return (
        <div className="login-container">
            {/* Left Side */}
            <div className="login-left">
                <div className="brand-icon">❄️</div>
                <h1>Hola<br />FerretControl!</h1>
                <p>
                    Gestiona activos, riesgos y usuarios con seguridad y eficiencia.
                    Tu SGSI simplificado mediante automatización inteligente.
                </p>
                <div className="copyright">
                    © 2026 FerretControl Systems. All rights reserved.
                </div>
            </div>

            {/* Right Side */}
            <div className="login-right">
                <div className="login-form-wrapper">
                    <div className="brand-logo-mobile">FerretControl</div>

                    <div className="login-header">
                        <h2>Bienvenido de nuevo!</h2>
                        <div className="login-subheader">
                            ¿No tienes cuenta?
                            <span style={{ marginLeft: 5, color: "#999" }}>Contacta al administrador</span>
                        </div>
                    </div>

                    {err && <div className="error-message">{err}</div>}

                    <form onSubmit={submit}>
                        <div className="form-group">
                            <input
                                className="form-input"
                                placeholder="Usuario o Correo"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                className="form-input"
                                placeholder="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Entrar Ahora
                        </button>

                        {/* Placeholder for future Google Login if needed */}
                        <div style={{ textAlign: 'center', margin: '1rem 0', color: '#ccc' }}>—— O ——</div>

                        <button type="button" className="btn-google" onClick={() => alert("Google Login no configurado en este MVP")}>
                            <span style={{ fontWeight: 'bold', color: '#4285F4' }}>G</span> Acceder con Google
                        </button>

                        <div className="forgot-password">
                            <span>¿Contraseña olvidada?</span>
                            <Link to="/forgot-password">Haz clic aquí</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

