import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminTaskManager from "./pages/admin/TaskManager";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Kollegy from "./pages/Kollegy";
import TaskManagerUser from './pages/user/TaskManagerUser'; // Путь к файлу TaskManagerUser.js

import { auth, db } from "./firebaseConfig";  // Импортируем auth и db из firebaseConfig
import { doc, getDoc } from "firebase/firestore"; // Импортируем необходимые функции Firestore

import { AuthProvider, useAuth } from './context/AuthContext'; // Импортируем AuthContext

function App() {
  const { currentUser, role, setRole } = useAuth(); // Используем контекст для получения пользователя и роли
  const [loading, setLoading] = useState(true); // Обрабатываем состояние загрузки

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        const docRef = doc(db, "users", user.uid); // Получаем ссылку на документ пользователя в Firestore
        const docSnap = await getDoc(docRef); // Получаем документ пользователя
        const userRole = docSnap.exists() ? docSnap.data().role : "user"; // Получаем роль пользователя
        setRole(userRole ? userRole.toLowerCase() : "user");
        setLoading(false); // Завершаем загрузку
      } else {
        setRole(null);
        setLoading(false); // Роль не найдена
      }
    });
    return unsubscribe;
  }, [setRole]);

  if (loading) return <div>Загрузка...</div>; // Пока данные не загружены

  return (
    <Router>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              !currentUser ? (
                <Login />
              ) : role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/tasks" replace />
              )
            }
          />

          <Route
            path="/register"
            element={
              !currentUser ? (
                <Register />
              ) : role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/tasks" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              currentUser && role === "admin" ? (
                <AdminTaskManager />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/tasks"
            element={
              currentUser && role === "user" ? (
                <TaskManagerUser /> // Это ваш компонент для задач пользователя
              ) : (
                <Navigate to="/login" replace /> // Если нет пользователя или роль не user, перенаправляем на логин
              )
            }
          />

          <Route
            path="/kollegy"
            element={currentUser ? <Kollegy /> : <Navigate to="/login" replace />}
          />

          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
