import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUserPlus, FiLoader } from "react-icons/fi";
import { auth, db, joinTeamByCode } from "../firebaseConfig";  // добавлен import joinTeamByCode
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");  // добавлено состояние для кода
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

      // Если введён код команды или компании — присоединяем
      if (joinCode.trim()) {
        await joinTeamByCode(joinCode.trim(), user.uid);
      }

      // После успешной регистрации перенаправляем на /admin
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      setError("Не удалось создать аккаунт или присоединиться по коду.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      '@media (max-width: 480px)': {
        padding: "0.5rem",
      },
    },
    title: {
      fontSize: "2.2rem",
      fontWeight: 800,
      color: "#0f172a",
      marginBottom: "1.5rem",
      background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textAlign: "center",
      letterSpacing: "-0.025em",
      '@media (max-width: 480px)': {
        fontSize: "1.8rem",
        marginBottom: "1rem",
      },
    },
    form: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "2rem",
      borderRadius: "24px",
      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
      border: "1px solid rgba(241, 245, 249, 0.8)",
      backdropFilter: "blur(8px)",
      width: "100%",
      maxWidth: "440px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      margin: "0 auto",
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
      '@media (max-width: 480px)': {
        padding: "0.7rem 1rem",
      },
      ':focus': {
        borderColor: "#4f46e5",
        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
      },
    },
    select: {
      width: "100%",
      padding: "0.8rem 1.2rem",
      fontSize: "0.95rem",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      cursor: "pointer",
      appearance: "none",
      '@media (max-width: 480px)': {
        padding: "0.7rem 1rem",
      },
    },
    button: {
      width: "100%",
      padding: "0.8rem 2rem",
      fontSize: "1rem",
      fontWeight: 600,
      background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.6rem",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      ':hover': {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
      },
    },
    error: {
      color: "#dc2626",
      backgroundColor: "#fee2e2",
      padding: "0.8rem",
      borderRadius: "8px",
      margin: "1rem 0",
      border: "1px solid #fca5a5",
      textAlign: "center",
      fontSize: "0.85rem",
    },
    linkText: {
      color: "#64748b",
      marginTop: "1.2rem",
      fontSize: "0.9rem",
      textAlign: "center",
      padding: "0 1rem",
    },
    link: {
      color: "#4f46e5",
      fontWeight: 600,
      textDecoration: "none",
      transition: "all 0.2s ease",
      ':hover': {
        color: "#4338ca",
        textDecoration: "underline",
      },
    },
    decorCircle: {
      position: "absolute",
      top: "-120px",
      right: "-120px",
      width: "300px",
      height: "300px",
      background: "radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.decorCircle} />
      <div style={{ 
        ...styles.decorCircle, 
        top: "auto", 
        bottom: "-150px", 
        left: "-120px", 
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)" 
      }} />

      <h1 style={styles.title}>Регистрация</h1>
      
      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Полное имя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
            autoFocus
          />
        </div>

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

        <div style={styles.inputContainer}>
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Код команды или компании"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.inputContainer}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
            disabled={loading}
          >
            <option value="user">Обычный пользователь</option>
            <option value="admin">Администратор</option>
          </select>
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
              Регистрация...
            </>
          ) : (
            <>
              <FiUserPlus />
              Создать аккаунт
            </>
          )}
        </button>
      </form>

      <p style={styles.linkText}>
        Уже есть аккаунт?{" "}
        <Link to="/login" style={styles.link}>
          Войти
        </Link>
      </p>
    </div>
  );
};

export default Register;
