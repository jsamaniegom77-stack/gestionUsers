import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            // Flow: User enters New Password first (as requested), then Email.
            // We store password in state. We request code with Email.

            await api.post("/api/auth/password_reset/request/", { email });
            setStep(2);
            setMessage("Se ha enviado un código de verificación a tu correo (revisa la consola del servidor).");
        } catch (err) {
            setError("Error al solicitar código. Verifica el correo.");
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await api.post("/api/auth/password_reset/confirm/", {
                email,
                code,
                new_password: newPassword
            });
            alert("Contraseña actualizada correctamente. Inicia sesión.");
            nav("/login");
        } catch (err) {
            setError("Código inválido o expirado.");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
            <h2>Recuperar Contraseña</h2>

            {message && <div style={{ background: "#e6fffa", color: "#2c7a7b", padding: 10, borderRadius: 4, marginBottom: 10 }}>{message}</div>}
            {error && <div style={{ background: "#fff5f5", color: "red", padding: 10, borderRadius: 4, marginBottom: 10 }}>{error}</div>}

            {step === 1 && (
                <form onSubmit={handleRequestCode} style={{ display: "grid", gap: 12 }}>
                    <p>Ingresa tu nueva contraseña y tu correo para recibir un código de validación.</p>

                    <div>
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>

                    <div>
                        <label>Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>

                    <div>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>

                    <button type="submit" style={{ padding: 10, background: "blue", color: "white", border: "none" }}>
                        Enviar Código
                    </button>

                    <div style={{ marginTop: 10 }}>
                        <Link to="/login">Volver al Login</Link>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleConfirmReset} style={{ display: "grid", gap: 12 }}>
                    <p>Ingresa el código de 6 dígitos enviado a <strong>{email}</strong></p>

                    <div>
                        <label>Código de Verificación</label>
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Ej: 123456"
                            required
                            style={{ width: "100%", padding: 8, fontSize: "1.2em", letterSpacing: 2 }}
                        />
                    </div>

                    <button type="submit" style={{ padding: 10, background: "green", color: "white", border: "none" }}>
                        Validar y Cambiar Contraseña
                    </button>

                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
                            Atrás
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
