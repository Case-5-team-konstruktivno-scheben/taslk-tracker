import React from "react";
import { FaTelegramPlane, FaVk, FaGithub } from "react-icons/fa";

const Footer = () => {
  // Стили, перенесенные из CSS
  const footerStyle = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start", // Выровнять секции по верхнему краю
    backgroundColor: "#333",
    color: "#fff",
    padding: "2rem 1rem",
    flexWrap: "wrap",
    gap: "2rem",
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "0.5rem",
  };

  const headingStyle = {
    marginTop: "0", // Убираем верхний отступ у заголовков
    marginBottom: "0.5rem",
  };

  const linkStyle = {
    color: "#dcdcdc",
    textDecoration: "none",
  };

  const iconsStyle = {
    display: "flex",
    gap: "1rem",
  };

  const iconStyle = {
    color: "white",
  };

  return (
    <footer style={footerStyle}>
      <div style={sectionStyle}>
        <h4 style={headingStyle}>Связаться с нами:</h4>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=konstruktivno.praktika@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          konstruktivno.praktika@gmail.com
        </a>
      </div>

      <div style={sectionStyle}>
        <h4 style={headingStyle}>Мы в соцсетях:</h4>
        <div style={iconsStyle}>
          <a
            href="https://t.me/your_tg"
            target="_blank"
            rel="noopener noreferrer"
            style={iconStyle}
          >
            <FaTelegramPlane size={24} />
          </a>
          <a
            href="https://vk.com/your_vk"
            target="_blank"
            rel="noopener noreferrer"
            style={iconStyle}
          >
            <FaVk size={24} />
          </a>
          <a
            href="https://github.com/your_github"
            target="_blank"
            rel="noopener noreferrer"
            style={iconStyle}
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>

      <div style={sectionStyle}>
        <a href="/privacy" style={linkStyle}>Политика конфиденциальности</a>
        <p>© 2025 Tusk</p>
      </div>
    </footer>
  );
};

export default Footer;

