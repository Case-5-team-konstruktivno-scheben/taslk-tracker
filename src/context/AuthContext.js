// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, getUserTeams } from "../firebaseConfig"; // добавили getUserTeams
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Создаем контекст для авторизации
export const AuthContext = createContext();

// Хук useAuth для доступа к контексту
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teamRoles, setTeamRoles] = useState({});  // состояние для ролей в командах
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Устанавливаем persistence один раз при инициализации
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => {
        console.error("Не удалось установить persistence:", err);
      })
      .then(() => {
        // Подписываемся на изменения авторизации
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setLoading(true);

          if (user) {
            // Получаем документ пользователя
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            // Извлекаем сохранённую роль (если есть)
            const savedRole = docSnap.exists() ? docSnap.data().role : "user";

            setCurrentUser(user);
            setRole(savedRole);

            // Получаем список команд пользователя и его роль в каждой
            try {
              const teams = await getUserTeams(user.uid);
              const rolesMap = {};
              teams.forEach(({ id, data }) => {
                const member = data.members.find(m => m.userId === user.uid);
                rolesMap[id] = member?.role ?? null;
              });
              setTeamRoles(rolesMap);
            } catch (err) {
              console.error("Ошибка при получении ролей команд:", err);
              setTeamRoles({});
            }
          } else {
            setCurrentUser(null);
            setRole(null);
            setTeamRoles({});
          }

          setLoading(false);
        });

        return unsubscribe;
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      teamRoles,     // теперь в контексте доступны роли пользователя в командах
      setRole,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
