import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiLogOut,
  FiHome,
  FiUsers,
  FiHelpCircle,
  FiLifeBuoy,
  FiInfo,
  FiClipboard,
} from "react-icons/fi";

const HoverLink = ({ to, children, onClick }) => {
  const [hover, setHover] = useState(false);

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: hover ? "#4f46e5" : "#0f172a",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: hover ? "rgba(79, 70, 229, 0.05)" : "transparent",
  };

  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      setCurrentUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка выхода:", error.message);
    }
  };

  // Определяем активные страницы
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";
  const isTasksPage = pathname === "/tasks";
  const isTeamsPage = pathname === "/teams";
  const isFriendRequestsPage = pathname === "/friend-requests";
  const isHelpPage = pathname === "/help";
  const isSupportPage = pathname === "/support";
  const isAboutPage = pathname === "/about";

  const styles = {
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 3rem",
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(241, 245, 249, 0.8)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
    },
    section: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    logo: {
      fontSize: "1.5rem",
      fontWeight: 700,
      background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.025em",
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.section}>
        {/* Вход / Выход */}
        {!currentUser && !isLoginPage && (
          <HoverLink to="/login">
            <FiLogOut size={18} /> Войти
          </HoverLink>
        )}
        {currentUser && (
          <HoverLink onClick={handleLogout}>
            <FiLogOut size={18} /> Выйти
          </HoverLink>
        )}

        {/* Главная */}
        {!isHomePage && (
          <HoverLink to="/">
            <FiHome size={18} /> Главная
          </HoverLink>
        )}

        {/* Задачи */}
        {currentUser && !isTasksPage && (
          <HoverLink to="/tasks">
            <FiClipboard size={18} /> Задачи
          </HoverLink>
        )}

        {/* Команды */}
        {currentUser && !isTeamsPage && (
          <HoverLink to="/teams">
            <FiUsers size={18} /> Команды
          </HoverLink>
        )}

        {/* Запросы в друзья */}
        {currentUser && !isFriendRequestsPage && (
          <HoverLink to="/friend-requests">
            <FiUsers size={18} /> Запросы в друзья
          </HoverLink>
        )}
      </div>

      <div style={styles.logo}>Tusk</div>

      <div style={styles.section}>
        {/* Справка */}
        {!isHelpPage && (
          <HoverLink to="/help">
            <FiHelpCircle size={18} /> Справка
          </HoverLink>
        )}

        {/* Поддержка */}
        {!isSupportPage && (
          <HoverLink to="/support">
            <FiLifeBuoy size={18} /> Поддержка
          </HoverLink>
        )}

        {/* О нас */}
        {!isAboutPage && (
          <HoverLink to="/about">
            <FiInfo size={18} /> О нас
          </HoverLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
