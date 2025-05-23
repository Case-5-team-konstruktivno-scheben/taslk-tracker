import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/login"); // Все пользователи, даже авторизованные, переходят на страницу входа.
    // Редиректы для авторизованных выполняются в App.js
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "#f0f0f0", // Легкий фон для всего контейнера
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: "#333",
        }}
      >
        Организуйте свою жизнь без лишних усилий
      </h1>
      <div
        style={{
          backgroundColor: "#fff",
          margin: "2rem auto",
          padding: "1.5rem",
          maxWidth: "700px",
          borderRadius: "16px",  // Увеличено округление
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Тень для блока
          fontSize: "1.1rem",
          color: "#555",
        }}
      >
        <p>
          <strong style={{ fontSize: "1.2rem", color: "#007bff" }}>Tusk</strong> — это
          простой и удобный онлайн-трекер задач, который поможет вам легко
          управлять ежедневными делами, проектами и списками задач. Начните
          организовывать свою жизнь уже сегодня.
        </p>
      </div>

      <button
        style={{
          backgroundColor: "#ffcba4",
          padding: "1.5rem 3rem",
          fontSize: "1.5rem",
          fontWeight: "bold",
          border: "none",
          borderRadius: "30px",  // Увеличено округление
          cursor: "pointer",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)", // Тень при нажатии
          transition: "all 0.3s ease", // Плавный переход для всех изменений
        }}
        onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        onClick={handleStartClick}
      >
        Начать
      </button>

      <div style={{ height: "260px" }}></div> {/* Пробел внизу */}
    </div>
  );
};

export default Home;
