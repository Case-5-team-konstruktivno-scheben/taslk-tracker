// src/services/authService.js
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

// ✅ Функция регистрации пользователя и сохранения в Firestore
export const registerUser = async (email, password, fullName) => {
  try {
    // Проверяем, существует ли пользователь с таким email
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Пользователь с таким email уже существует");
    }

    // Создаем пользователя через Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Сохраняем данные пользователя в Firestore
    const userRef = doc(collection(db, "users"), user.uid);
    await setDoc(userRef, {
      fullName: fullName,
      email: email,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// ✅ Функция входа пользователя
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// ✅ Функция выхода пользователя
export const logoutUser = async () => {
  await signOut(auth);
};
