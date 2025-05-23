import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role: role.toLowerCase(),
        createdAt: new Date(),
      });

    } catch (error) {
      console.error(error);
      setError("Не удалось создать аккаунт.");
    } finally {
      setLoading(false);
    }
  };

  // Стили, перенесенные из CSS
  const containerStyle = {
    padding: "2rem",
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
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
    padding: "2rem",
  };

  const inputStyle = {
    padding: "0.75rem",
    fontSize: "1.25rem",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    borderRadius: "1rem",
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
    marginBottom: "0.5rem",
  };

  const buttonStyle = {
    backgroundColor: "#ffcba4",
    padding: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "2rem",
    cursor: "pointer",
    width: "100%",
  };

  const errorStyle = {
    color: "red",
    textAlign: "center",
  };

  const loginRedirectStyle = {
    marginTop: "1rem",
    fontSize: "1rem",
    textAlign: "center",
  };

  const loginLinkStyle = {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2.5rem", textAlign: "center" }}>Регистрация</h1>
      <form onSubmit={handleRegister} style={formStyle}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="fullName">Полное имя</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Введите полное имя"
            style={inputStyle}
            disabled={loading}
            autoFocus
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="email">Почта</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Введите почту"
            style={inputStyle}
            disabled={loading}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Введите пароль"
            style={inputStyle}
            disabled={loading}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Подтвердите пароль"
            style={inputStyle}
            disabled={loading}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="role">Роль</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
            disabled={loading}
          >
            <option value="user">Обычный пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        {error && <p style={errorStyle}>{error}</p>}
        <button
          type="submit"
          style={{
            ...buttonStyle,
            transform: hover ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.2s ease",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          disabled={loading}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <div style={loginRedirectStyle}>
        <span>Уже есть аккаунт? </span>
        <Link to="/login" style={loginLinkStyle}>
          Войти
        </Link>
      </div>
    </div>
  );
};

export default Register;
