import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Получаем роль из Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Данные пользователя из Firestore после логина:", docSnap.data());
        const role = docSnap.data().role.toLowerCase();
        console.log("Роль пользователя после логина:", role);

        if (role === "admin") {
          navigate("/admin");
        } else if (role === "user") {
          navigate("/tasks");
        } else {
          setError("Неизвестная роль пользователя.");
        }
      } else {
        setError("Не удалось определить роль пользователя.");
      }
    } catch (error) {
      setError("Неверные данные для входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h1 style={styles.title}>Вход</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputContainer}>
          <label htmlFor="email">Почта</label>
          <input
            autoFocus
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Введите почту"
            style={styles.input}
            disabled={loading}
          />
        </div>
        <div style={styles.inputContainer}>
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Введите пароль"
            style={styles.input}
            disabled={loading}
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button
          type="submit"
          style={{
            ...styles.button,
            transform: hover ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.2s ease",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
      <p style={styles.linkText}>
        Нет аккаунта?{" "}
        <Link to="/register" style={styles.link}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
};

const styles = {
  formContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#f3f3f3",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  title: {
    fontSize: "2.5rem",
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
    padding: "2rem",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1.25rem",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    borderRadius: "1rem",
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
    marginBottom: "0.5rem",
  },
  button: {
    backgroundColor: "#ffcba4",
    padding: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "2rem",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  linkText: {
    textAlign: "center",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default Login;