import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile"; // Страница профиля
import Home from "./pages/Home"; // с большой буквы "H" для компонента Home
import { auth } from "./firebaseConfig";
import { createFooter } from './components/Footer.js';


document.body.appendChild(createFooter());

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // Сохраняем состояние авторизации пользователя
    });

    return unsubscribe; // Очистка подписки при размонтировании компонента
  }, []);

  return (
    <Router>
      <NavigationBar />
      <Routes>
        {/* Указываем маршрут для главной страницы */}
        <Route path="/" element={<Home />} /> {/* Главная страница */}

        {/* Остальные страницы */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
