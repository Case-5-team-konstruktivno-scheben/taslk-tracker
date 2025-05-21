import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("user");

  const handleStart = () => {
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="homepage">
      <h1>Организуйте свою жизнь без лишних усилий</h1>
      <p className="lead">
        <strong>Tusk</strong> — это простой и удобный онлайн-трекер задач, который поможет вам
        легко управлять ежедневными делами, проектами и списками задач. Благодаря дружелюбному
        интерфейсу Tusk позволяет без труда создавать задачи, устанавливать сроки, расставлять
        приоритеты и работать в команде. Начните организовывать свою жизнь уже сегодня.
      </p>

      <Button className="cta-button" onClick={handleStart}>
        Начать
      </Button>
    </div>
  );
}
