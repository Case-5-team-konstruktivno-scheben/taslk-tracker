// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Подключаем Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBHKIRfKv48RSG5Qf3-CKre4ffgzLw02gg",
  authDomain: "task-tracker-fb9f7.firebaseapp.com",
  projectId: "task-tracker-fb9f7",
  storageBucket: "task-tracker-fb9f7.firebasestorage.app",
  messagingSenderId: "969938598232",
  appId: "1:969938598232:web:c12eec649a7b432bc08d2d",
  measurementId: "G-W76VWWSFTD"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Инициализация Firestore

// Устанавливаем persistent сессию
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Ошибка при установке сессии:", error.message);
});

export { auth, db }; // Экспортируем и auth, и db


