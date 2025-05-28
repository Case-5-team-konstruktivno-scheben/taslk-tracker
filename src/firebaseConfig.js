// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  arrayUnion
} from "firebase/firestore";

// Настройки Firebase
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

// Инициализация сервисов
const auth = getAuth(app);
const db = getFirestore(app);

// Экспортируем объекты аутентификации и базы данных для использования в других частях проекта
export { auth, db };

/**
 * Регистрирует нового пользователя и сохраняет его данные в Firestore,
 * назначая при необходимости companyId и teamId.
 */
export const registerUser = async (
  fullName,
  email,
  password,
  companyId = null,
  teamId = null
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Инициализация данных пользователя в Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      companyId,
      teamIds: teamId ? [teamId] : [],
      points: 0, // Добавляем поле points с начальным значением
      level: "Novice" // Уровень по умолчанию
    });

    console.log("Пользователь зарегистрирован:", user.uid);
    return user;
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error);
    throw error;
  }
};

/**
 * Функция для увеличения очков пользователя.
 */
export const increaseUserPoints = async (userId, points) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Пользователь не найден");
    }

    const userData = userSnap.data();
    const currentPoints = userData.points || 0;

    // Обновляем очки пользователя
    await updateDoc(userRef, {
      points: currentPoints + points
    });

    console.log(`Очки пользователя ${userId} увеличены на ${points}`);
  } catch (error) {
    console.error("Ошибка при увеличении очков пользователя:", error);
    throw error;
  }
};

/**
 * Создает новую компанию и возвращает ее ID.
 */
export const createCompany = async (name) => {
  try {
    const ownerId = auth.currentUser.uid;
    const companyRef = await addDoc(collection(db, "companies"), {
      name,
      ownerId,
      createdAt: new Date().toISOString()
    });
    console.log("Компания создана, ID:", companyRef.id);
    return companyRef.id;
  } catch (error) {
    console.error("Ошибка при создании компании:", error);
    throw error;
  }
};

/**
 * Создает новую команду внутри компании и возвращает объект с ID и кодом присоединения.
 */
export const createTeam = async (name, companyId) => {
  try {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const teamRef = await addDoc(collection(db, "teams"), {
      name,
      companyId,
      joinCode,
      members: []
    });
    console.log("Команда создана, ID:", teamRef.id, "код:", joinCode);
    return { teamId: teamRef.id, joinCode };
  } catch (error) {
    console.error("Ошибка при создании команды:", error);
    throw error;
  }
};

/**
 * Позволяет пользователю присоединиться к команде по коду.
 */
export const joinTeamByCode = async (code, userId) => {
  try {
    const q = query(
      collection(db, "teams"),
      where("joinCode", "==", code)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("Команда с таким кодом не найдена");
    }

    const teamDoc = querySnapshot.docs[0];
    const teamId = teamDoc.id;
    const teamData = teamDoc.data();

    await updateDoc(doc(db, "teams", teamId), {
      members: arrayUnion({ userId, role: "member" })
    });

    await updateDoc(doc(db, "users", userId), {
      teamIds: arrayUnion(teamId),
      companyId: teamData.companyId
    });

    console.log(`Пользователь ${userId} присоединился к команде ${teamId}`);
  } catch (error) {
    console.error("Ошибка при присоединении к команде:", error);
    throw error;
  }
};

// Функции работы с запросами в друзья
export const sendFriendRequest = async (senderId, receiverId) => {
  try {
    await addDoc(collection(db, "friend_requests"), {
      senderId,
      receiverId,
      status: "pending"
    });
    console.log("Запрос в друзья отправлен");
  } catch (error) {
    console.error("Ошибка при отправке запроса в друзья:", error);
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const requestRef = doc(db, "friend_requests", requestId);
    await updateDoc(requestRef, { status: "accepted" });
    console.log("Запрос в друзья принят");
  } catch (error) {
    console.error("Ошибка при принятии запроса в друзья:", error);
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const requestRef = doc(db, "friend_requests", requestId);
    await updateDoc(requestRef, { status: "rejected" });
    console.log("Запрос в друзья отклонён");
  } catch (error) {
    console.error("Ошибка при отклонении запроса в друзья:", error);
  }
};

/**
 * Возвращает список команд, в которых состоит пользователь.
 */
export const getUserTeams = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (!userSnap.exists()) return [];
    const { teamIds = [] } = userSnap.data();

    const teamPromises = teamIds.map((tid) => getDoc(doc(db, "teams", tid)));
    const teamSnaps = await Promise.all(teamPromises);

    return teamSnaps
      .filter((snap) => snap.exists())
      .map((snap) => ({ id: snap.id, data: snap.data() }));
  } catch (error) {
    console.error("Ошибка при получении команд пользователя:", error);
    throw error;
  }
};

/**
 * Возвращает роль пользователя в указанной команде.
 */
export const getTeamRole = async (teamId, userId) => {
  try {
    const teamSnap = await getDoc(doc(db, "teams", teamId));
    if (!teamSnap.exists()) return null;
    const { members = [] } = teamSnap.data();
    const member = members.find((m) => m.userId === userId);
    return member ? member.role : null;
  } catch (error) {
    console.error("Ошибка при получении роли в команде:", error);
    throw error;
  }
};

export const isOwner = async (teamId, userId) => {
  const role = await getTeamRole(teamId, userId);
  return role === "owner";
};

export const isManager = async (teamId, userId) => {
  const role = await getTeamRole(teamId, userId);
  return role === "manager";
};

export const isMember = async (teamId, userId) => {
  const role = await getTeamRole(teamId, userId);
  return role === "member";
};

export const isObserver = async (teamId, userId) => {
  const role = await getTeamRole(teamId, userId);
  return role === "observer";
};

/**
 * Возвращает команду по коду присоединения.
 */
export const getTeamByJoinCode = async (code) => {
  const q = query(collection(db, "teams"), where("joinCode", "==", code));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error("Команда с таким кодом не найдена");
  }
  const teamDoc = querySnapshot.docs[0];
  return { id: teamDoc.id, data: teamDoc.data() };
};

/**
 * Добавляет пользователя в команду с указанной ролью и обновляет документ пользователя.
 */
export const addUserToTeam = async (teamId, userId, role = "member") => {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) {
    throw new Error("Команда не найдена");
  }

  await updateDoc(teamRef, {
    members: arrayUnion({ userId, role })
  });

  const { companyId } = teamSnap.data();
  await updateDoc(doc(db, "users", userId), {
    teamIds: arrayUnion(teamId),
    companyId
  });

  console.log(`Пользователь ${userId} добавлен в команду ${teamId} как ${role}`);
};

/**
 * Утилита для проверки прав пользователя в команде по заданному действию.
 */
export const hasPermission = (team, userId, action) => {
  const member = team.members.find(m => m.userId === userId);
  if (!member) return false;
  const role = member.role;
  const rolePermissions = {
    owner: ["assign_task", "manage_team"],
    manager: ["assign_task"],
    member: [],
    observer: []
  };
  return rolePermissions[role]?.includes(action);
};
