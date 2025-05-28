import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi"; // Добавляем иконку

const Home = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            marginBottom: "2rem",
            color: "#0f172a",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Организуйте свою жизнь
          <br />
          <span style={{ fontSize: "2.5rem", fontWeight: "600" }}>
            с умным трекером задач
          </span>
        </h1>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            margin: "2rem auto",
            padding: "2.5rem",
            maxWidth: "800px",
            borderRadius: "24px",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
            border: "1px solid rgba(241, 245, 249, 0.8)",
            backdropFilter: "blur(8px)",
            position: "relative",
            transform: "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            ':hover': {
              transform: "translateY(-4px)",
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
            },
          }}
        >
          <p
            style={{
              fontSize: "1.25rem",
              color: "#475569",
              lineHeight: 1.6,
              margin: "0 auto",
              maxWidth: "600px",
            }}
          >
            <strong
              style={{
                fontSize: "1.4rem",
                background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tusk
            </strong>{" "}
            — ваш персональный помощник в мире продуктивности. Создавайте задачи,
            устанавливайте приоритеты и отслеживайте прогресс с интуитивно
            понятным интерфейсом.
          </p>
        </div>

        <button
          style={{
            background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
            color: "#fff",
            padding: "1.25rem 3rem",
            fontSize: "1.25rem",
            fontWeight: "600",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(79, 70, 229, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "3rem",
            position: "relative",
            overflow: "hidden",
            ':hover': {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
            },
            ':active': {
              transform: "translateY(0)",
            },
          }}
          onClick={handleStartClick}
        >
          <span>Начать сейчас</span>
          <FiArrowRight style={{ fontSize: "1.5rem", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Декоративные элементы фона */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-300px",
          left: "-200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default Home;