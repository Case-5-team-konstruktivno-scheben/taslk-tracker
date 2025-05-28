// src/App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teams from "./pages/Teams";
import TeamPage from "./pages/TeamPage/TeamPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RedirectToTeam from "./pages/RedirectToTeam";

import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { currentUser, setRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подгружаем и кэшируем роль пользователя
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        const userRole = snap.exists()
          ? snap.data().role.toLowerCase()
          : "user";
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setRole]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        Загрузка данных...
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Корневой маршрут: всегда используем RedirectToTeam, он сам решит, куда идти */}
          <Route path="/" element={<RedirectToTeam />} />

          {/* Аутентификация */}
          <Route
            path="/login"
            element={
              !currentUser
                ? <Login />
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/register"
            element={
              !currentUser
                ? <Register />
                : <Navigate to="/" replace />
            }
          />

          {/* Список команд */}
          <Route
            path="/teams"
            element={
              currentUser
                ? <Teams />
                : <Navigate to="/login" replace />
            }
          />

          {/* Страница конкретной команды */}
          <Route
            path="/team/:teamId"
            element={
              currentUser
                ? <TeamPage />
                : <Navigate to="/login" replace />
            }
          />

          {/* Прочие */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Любые другие пути → на корень */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
