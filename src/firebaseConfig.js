// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Ваш объект конфигурации Firebase
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

// Экспорт объектов аутентификации и базы данных для использования в других файлах
export const auth = getAuth(app);
export const db = getFirestore(app);

