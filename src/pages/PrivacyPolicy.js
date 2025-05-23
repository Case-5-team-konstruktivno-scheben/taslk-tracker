import React from "react";

const PrivacyPolicy = () => {
  // Стили, перенесенные из CSS
  const containerStyle = {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headingStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
  };

  const paragraphStyle = {
    fontSize: "1rem",
    lineHeight: "1.5",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Политика конфиденциальности</h2>
      <p style={paragraphStyle}>
        Здесь будет размещён текст политики конфиденциальности. Вы можете
        указать, какие данные собираются, как используются, как хранятся, и т.д.
      </p>
    </div>
  );
};

export default PrivacyPolicy;

