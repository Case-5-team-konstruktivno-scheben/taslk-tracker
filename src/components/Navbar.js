import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Компоненты с hover эффектами
const HoverLink = ({ to, children, onClick }) => {
  const [hover, setHover] = useState(false);
  
  const linkStyle = {
    textDecoration: "none",
    color: "black",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    backgroundColor: "transparent",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px", 
    transform: hover ? "scale(1.1)" : "scale(1)",
  };

  const hoverStyle = {
    color: "black",
  };

  return (
    <Link
      to={to}
      style={{ ...linkStyle, ...(hover ? hoverStyle : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick} // Передаем onClick сюда
    >
      {children}
    </Link>
  );
};

const HoverButton = ({ onClick, children }) => {
  const [hover, setHover] = useState(false);
  
  const buttonStyle = {
    backgroundColor: "transparent",
    color: "black",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    transform: hover ? "scale(1.1)" : "scale(1)",
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth); // Выход из аккаунта
      setCurrentUser(null); // Обновляем состояние текущего пользователя
      navigate("/login"); // Перенаправляем на страницу логина
    } catch (error) {
      console.error("Ошибка выхода:", error.message);
    }
  };

  const isKollegyPage = location.pathname === "/kollegy";
  const isHomePage = location.pathname === "/";

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid #ddd",
    fontWeight: "500",
  };

  const leftStyle = {
    display: "flex",
    gap: "1rem",
  };

  const centerStyle = {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  };

  const rightStyle = {
    display: "flex",
    gap: "1rem",
  };

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        {!currentUser ? (
          <HoverLink to="/login">Войти</HoverLink>
        ) : (
          <HoverLink onClick={handleLogout}>Выйти</HoverLink>
        )}

        {!isHomePage && (
          <HoverLink to="/">Главная</HoverLink>
        )}

        {currentUser && !isKollegyPage && (
          <HoverLink to="/kollegy">Коллеги</HoverLink>
        )}
      </div>

      <div style={centerStyle}>Tusk</div>

      <div style={rightStyle}>
        <HoverLink to="/help">Справка</HoverLink>
        <HoverLink to="/support">Поддержка</HoverLink>
        <HoverLink to="/about">О нас</HoverLink>
      </div>
    </nav>
  );
};

export default Navbar;
