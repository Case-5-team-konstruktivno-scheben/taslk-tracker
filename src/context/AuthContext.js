// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";  // Путь к Firebase
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Создаем контекст для авторизации
export const AuthContext = createContext();

// Хук useAuth для использования контекста
export const useAuth = () => {
  return useContext(AuthContext); // Хук для доступа к контексту
};

// Создаем AuthProvider, который будет оборачивать приложение
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Начинаем загрузку данных
        const userRef = doc(db, "users", user.uid); // Получаем ссылку на документ пользователя в Firestore
        const docSnap = await getDoc(userRef); // Получаем документ пользователя

        if (docSnap.exists()) {
          // Если документ существует, сохраняем данные о пользователе в состояние
          setCurrentUser({ ...user, role: docSnap.data().role });
          setRole(docSnap.data().role); // Устанавливаем роль пользователя
        } else {
          setCurrentUser({ ...user, role: "user" }); // Если роль не найдена, назначаем роль "user"
          setRole("user"); // Устанавливаем роль по умолчанию
        }
      } else {
        setCurrentUser(null); // Если пользователь не авторизован, сбрасываем состояние
        setRole(null); // Роль сбрасывается
      }
      setLoading(false); // Завершаем загрузку
    });

    return unsubscribe; // Очищаем подписку при размонтировании компонента
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
