import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiLogIn, FiLoader } from "react-icons/fi";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

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
      navigate("/teams", { replace: true });
    } catch (error) {
      setError("Неверные данные для входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      
      <div style={styles.decorCircle} />
      <div
        style={{
          ...styles.decorCircle,
          top: "auto",
          bottom: "-300px",
          left: "-200px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
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
            cursor: loading ? "not-allowed" : "pointer",
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
    fontFamily: "'Inter', sans-serif",
  },
  decorCircle: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)",
    top: "-200px",
    right: "-200px",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: 800,
    marginBottom: "2rem",
    background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    letterSpacing: "-0.025em",
    color: "#0f172a",
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
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "translateY(0)",
    margin: "0 auto",

    ':hover': {
      transform: "translateY(-4px)",
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
    },
  },
  inputContainer: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1.2rem",
    fontSize: "0.95rem",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: 600,
    background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    boxShadow: "0 6px 16px rgba(79, 70, 229, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ':hover': {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
    },
    ':active': {
      transform: "translateY(0)",
    },
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
  linkText: {
    marginTop: "1rem",
    fontSize: "0.95rem",
    color: "#64748b",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default Login;
