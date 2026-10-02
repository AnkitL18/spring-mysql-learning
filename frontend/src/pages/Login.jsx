import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api/api";
import { saveAuth } from "../utils/auth";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await post("/auth/login", form);

            const token =
                response.token ||
                response.jwt ||
                response.accessToken;

            if (!token) {
                throw new Error(
                    "Login succeeded but no JWT token was returned."
                );
            }

            saveAuth(token, {
                email: form.email
            });

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Business Operations</h1>

                <p className="subtitle">
                    Sign in to manage your business
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;