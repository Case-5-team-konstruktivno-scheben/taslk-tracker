import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiLogIn, FiLoader } from "react-icons/fi";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";  // оставляем импорт по требованию

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // После успешного входа всегда направляем на /admin
      navigate("/admin", { replace: true });
    } catch (error) {
      setError("Неверные данные для входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      {/* Декоративные элементы фона */}
      <div style={styles.decorCircle} />
      <div
        style={{
          ...styles.decorCircle,
          top: "auto",
          bottom: "-200px",
          left: "-150px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)"
        }}
      />

      <h1 style={styles.title}>Вход в систему</h1>

      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputContainer}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader style={{ animation: "spin 1s linear infinite" }} />
              Загрузка...
            </>
          ) : (
            <>
              <FiLogIn />
              Войти
            </>
          )}
        </button>
      </form>

      <p style={styles.linkText}>
        Нет аккаунта?{" "}
        <Link to="/register" style={styles.link}>
          Создать аккаунт
        </Link>
      </p>
    </div>
  );
};

const styles = {
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif"
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "2rem",
    background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    letterSpacing: "-0.025em"
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "2.5rem",
    borderRadius: "24px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
    border: "1px solid rgba(241, 245, 249, 0.8)",
    backdropFilter: "blur(8px)",
    width: "100%",
    maxWidth: "440px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  inputContainer: {
    marginBottom: "1.5rem"
  },
  input: {
    width: "100%",
    padding: "1rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative"
  },
  error: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: "1rem",
    borderRadius: "8px",
    margin: "1.5rem 0",
    border: "1px solid #fca5a5",
    textAlign: "center",
    fontSize: "0.9rem"
  },
  linkText: {
    color: "#64748b",
    marginTop: "2rem",
    fontSize: "0.95rem"
  },
  link: {
    color: "#4f46e5",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  decorCircle: {
    position: "absolute",
    top: "-150px",
    right: "-150px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)",
    pointerEvents: "none"
  }
};

export default Login;
