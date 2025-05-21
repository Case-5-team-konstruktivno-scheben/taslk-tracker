// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <nav className="nav-left">
        <Link to="/">Главная</Link>
        <Link to="/dashboard">Создать задачу</Link>
        <Link to="/login">Войти</Link>
      </nav>

      <div className="nav-center" onClick={() => navigate("/")}>
        <strong>Tusk</strong>
      </div>

      <nav className="nav-right">
        <a href="#">Справка</a>
        <a href="#">Поддержка</a>
        <a href="#">О нас</a>
      </nav>
    </header>
  );
}
