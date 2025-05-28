

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
import Home from "./pages/Home";

import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { currentUser, setRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          
          <Route path="/" element={<Home />} />

          <Route
            path="/redirect"
            element={<RedirectToTeam />}
          />

          <Route
            path="/login"
            element={
              !currentUser
                ? <Login />
                : <Navigate to="/redirect" replace />
            }
          />
          <Route
            path="/register"
            element={
              !currentUser
                ? <Register />
                : <Navigate to="/redirect" replace />
            }
          />

          <Route
            path="/teams"
            element={
              currentUser
                ? <Teams />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/team/:teamId"
            element={
              currentUser
                ? <TeamPage />
                : <Navigate to="/login" replace />
            }
          />

          <Route path="/privacy" element={<PrivacyPolicy />} />

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
