import React from "react";
import { FiMail, FiGithub, FiExternalLink } from "react-icons/fi";
import { FaTelegramPlane, FaVk } from "react-icons/fa";

const Footer = () => {
  const styles = {
    footer: {
      display: "flex",
      justifyContent: "space-around",
      alignItems: "flex-start",
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(241, 245, 249, 0.8)",
      padding: "3rem 2rem",
      flexWrap: "wrap",
      gap: "2rem",
      marginTop: "auto",
    },
    section: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "0.8rem",
      minWidth: "220px",
    },
    heading: {
      margin: 0,
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    link: {
      color: "#475569",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transition: "all 0.2s ease",
      ':hover': {
        color: "#4f46e5",
        transform: "translateX(4px)",
      },
    },
    icons: {
      display: "flex",
      gap: "1.5rem",
      marginTop: "0.5rem",
    },
    icon: {
      color: "#64748b",
      transition: "all 0.2s ease",
      cursor: "pointer",
      ':hover': {
        color: "#4f46e5",
        transform: "translateY(-2px)",
      },
    },
    divider: {
      width: "80%",
      height: "1px",
      background: "linear-gradient(90deg, transparent 0%, rgba(79, 70, 229, 0.1) 50%, transparent 100%)",
      margin: "1.5rem 0",
    },
    copyright: {
      color: "#64748b",
      fontSize: "0.9rem",
      marginTop: "2rem",
      textAlign: "center",
      width: "100%",
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.section}>
        <h4 style={styles.heading}>
          <FiMail />
          Контакты
        </h4>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=konstruktivno.praktika@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          konstruktivno.praktika@gmail.com
          <FiExternalLink />
        </a>
      </div>

      <div style={styles.section}>
        <h4 style={styles.heading}>Социальные сети</h4>
        <div style={styles.icons}>
          <a
            href="https://t.me/komputornie_technologii"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.icon}
          >
            <FaTelegramPlane size={24} />
          </a>
          <a
            href="https://vk.com/ktiib"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.icon}
          >
            <FaVk size={24} />
          </a>
          <a
            href="https://github.com/your_github"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.icon}
          >
            <FiGithub size={24} />
          </a>
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.heading}>Правовая информация</h4>
        <a href="/privacy" style={styles.link}>
          Политика конфиденциальности
        </a>
      </div>

      <div style={styles.divider} />
      
      <p style={styles.copyright}>
        © 2025 Tusk · Управляй задачами с умом
      </p>
    </footer>
  );
};

export default Footer;