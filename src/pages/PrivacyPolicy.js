import React from "react";

const PrivacyPolicy = () => {
  const styles = {
    container: {
      position: "relative",
      padding: "2rem",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "start",
      overflow: "hidden",
    },
    decorCircleTop: {
      position: "absolute",
      top: "-200px",
      right: "-200px",
      width: "600px",
      height: "600px",
      background:
        "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    decorCircleBottom: {
      position: "absolute",
      bottom: "-300px",
      left: "-200px",
      width: "600px",
      height: "600px",
      background:
        "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    card: {
      backgroundColor: "rgba(255,255,255,0.95)",
      borderRadius: "24px",
      border: "1px solid rgba(241,245,249,0.8)",
      boxShadow: "0 12px 32px rgba(15,23,42,0.1)",
      backdropFilter: "blur(8px)",
      maxWidth: "800px",
      width: "100%",
      padding: "2rem",
      zIndex: 1,
    },
    heading: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "1.5rem",
      background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "#0f172a",
    },
    paragraph: {
      fontSize: "1rem",
      lineHeight: 1.6,
      marginBottom: "1rem",
      color: "#475569",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.decorCircleTop} />
      <div style={styles.decorCircleBottom} />

      <div style={styles.card}>
        <h2 style={styles.heading}>Политика конфиденциальности</h2>

        <p style={styles.paragraph}>
          Мы уважаем вашу конфиденциальность и стараемся минимизировать сбор данных. Ниже указано, что мы можем собирать и как это используется.
        </p>

        <p style={styles.paragraph}>
          <strong>1. Какие данные собираем:</strong> имя, email, пароль, действия в сервисе, IP-адрес и данные о браузере.
        </p>

        <p style={styles.paragraph}>
          <strong>2. Зачем собираем:</strong> для предоставления доступа к сервису, обеспечения работы функций и улучшения стабильности.
        </p>

        <p style={styles.paragraph}>
          <strong>3. Кто имеет доступ:</strong> только мы и сервисы, обеспечивающие работу платформы (например, Firebase). Данные не передаются третьим лицам без необходимости.
        </p>

        <p style={styles.paragraph}>
          <strong>4. Безопасность:</strong> применяются базовые меры защиты. Публичный доступ к данным отсутствует.
        </p>

        <p style={styles.paragraph}>
          <strong>5. Ваши права:</strong> вы можете запросить удаление или изменение данных, а также прекратить использование сервиса.
        </p>

        <p style={styles.paragraph}>
          <strong>6. Контакты:</strong> konstruktivno.praktika@gmail.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
