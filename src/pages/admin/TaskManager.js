import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import TaskForm from "./TaskForm";
import CategorySelector from "../CategorySelector";
import TaskList from "./TaskList";

const generateIdFromName = (name) => name.toLowerCase().replace(/\s+/g, "-");

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [priority, setPriority] = useState(false);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [category, setCategory] = useState(""); // выбранная категория для формы
  const [currentUser, setCurrentUser] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({
    task: "",
    description: "",
    endDate: null,
    status: "closed",
    categoryId: "",
    notificationType: "never",
    notificationDate: null,
    notificationInterval: null,
    notificationDailyTime: null,
    notificationTrigger: null,
  });

  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [notificationType, setNotificationType] = useState("never");
  const [notificationDate, setNotificationDate] = useState(null);
  const [notificationInterval, setNotificationInterval] = useState(null);
  const [notificationDailyTime, setNotificationDailyTime] = useState(null);
  const [notificationTrigger, setNotificationTrigger] = useState(null);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadCategories(user.uid);
        loadTasks(user.uid);
        loadFriends(user.uid);
        loadUsers();
      } else {
        setTasks([]);
        setCategories([]);
        setFriends([]);
        setSelectedFriends([]);
        setUsers([]);
        setSelectedUser("");
      }
    });
    return unsubscribe;
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const loadedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  };

  const loadFriends = async (uid) => {
    try {
      // Пример списка друзей, замени на реальный запрос если нужно
      const loadedFriends = [
        { id: "f1", name: "Иван" },
        { id: "f2", name: "Мария" },
        { id: "f3", name: "Пётр" },
      ];
      setFriends(loadedFriends);
    } catch (error) {
      console.error("Ошибка загрузки друзей:", error);
    }
  };

  const loadCategories = async (uid) => {
    try {
      const q = query(collection(db, "categories"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      let loadedCats = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
        };
      });
      setCategories(loadedCats.length === 0 ? [] : loadedCats);
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const loadTasks = async (uid) => {
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      let loadedTasks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          endDate: data.endDate ? new Date(data.endDate) : null,
          notificationDate: data.notificationDate ? new Date(data.notificationDate) : null,
          notificationDailyTime: data.notificationDailyTime ? new Date(data.notificationDailyTime) : null,
        };
      });

      loadedTasks.sort((a, b) => (a.priority === b.priority ? 0 : a.priority ? -1 : 1));

      setTasks(loadedTasks);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    }
  };

  const handleAddTask = async () => {
    if (!taskInput || !endDate || !selectedUser) {
      alert("Заполните все поля и выберите пользователя для назначения задачи");
      return;
    }
    if (!currentUser) {
      alert("Пользователь не авторизован");
      return;
    }
    try {
      const newTask = {
        task: taskInput,
        description: descriptionInput,
        endDate: endDate.toISOString(),
        priority,
        status: "closed",
        categoryId: category || "",
        userId: currentUser.uid,
        assignedTo: selectedUser, // ключевой момент!
        friendIds: selectedFriends.map((f) => f.id),
        notificationType,
        notificationDate: notificationDate ? notificationDate.toISOString() : null,
        notificationInterval,
        notificationDailyTime: notificationDailyTime ? notificationDailyTime.toISOString() : null,
        notificationTrigger,
        createdAt: new Date().toISOString(), // Добавлено поле для даты создания
      };

      // Проверяем, существует ли уже задача в базе данных с такими же параметрами
      const taskRef = query(collection(db, "tasks"), where("task", "==", newTask.task), where("assignedTo", "==", newTask.assignedTo));
      const querySnapshot = await getDocs(taskRef);
      if (!querySnapshot.empty) {
        console.log("Задача уже существует в базе данных");
        return; // Если задача уже существует, не добавляем её заново
      }

      // Добавляем задачу в Firestore
      await addDoc(collection(db, "tasks"), newTask);

      setTaskInput("");
      setDescriptionInput("");
      setEndDate(null);
      setPriority(false);
      setCategory("");
      setSelectedCategory("all");
      setSelectedFriends([]);
      setSelectedUser("");

      setNotificationType("never");
      setNotificationDate(null);
      setNotificationInterval(null);
      setNotificationDailyTime(null);
      setNotificationTrigger(null);

      loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка добавления задачи:", error);
    }
  };

  const handleTogglePriority = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        priority: !task.priority,
      });
      loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка обновления приоритета:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка удаления задачи:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        status: "completed",
      });
      loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка завершения задачи:", error);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTaskData({
      task: task.task,
      description: task.description || "",
      endDate: task.endDate ? new Date(task.endDate) : null,
      status: task.status || "closed",
      categoryId: task.categoryId || "",
      notificationType: task.notificationType || "never",
      notificationDate: task.notificationDate ? new Date(task.notificationDate) : null,
      notificationInterval: task.notificationInterval || null,
      notificationDailyTime: task.notificationDailyTime ? new Date(task.notificationDailyTime) : null,
      notificationTrigger: task.notificationTrigger || null,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTaskData({
      task: "",
      description: "",
      endDate: null,
      status: "closed",
      categoryId: "",
      notificationType: "never",
      notificationDate: null,
      notificationInterval: null,
      notificationDailyTime: null,
      notificationTrigger: null,
    });
    setCategoryPickerVisible(false);
  };

  const saveEditing = async () => {
    if (!editTaskData.task || !editTaskData.endDate) {
      alert("Название и дата окончания обязательны");
      return;
    }
    try {
      const taskRef = doc(db, "tasks", editingTaskId);
      await updateDoc(taskRef, {
        task: editTaskData.task,
        description: editTaskData.description,
        endDate: editTaskData.endDate.toISOString(),
        status: editTaskData.status,
        categoryId: editTaskData.categoryId || "",

        notificationType: editTaskData.notificationType || "never",
        notificationDate: editTaskData.notificationDate
          ? editTaskData.notificationDate.toISOString()
          : null,
        notificationInterval: editTaskData.notificationInterval || null,
        notificationDailyTime: editTaskData.notificationDailyTime
          ? editTaskData.notificationDailyTime.toISOString()
          : null,
        notificationTrigger: editTaskData.notificationTrigger || null,
      });
      cancelEditing();
      loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка сохранения задачи:", error);
    }
  };

  const addCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Такая категория уже существует");
      return;
    }

    if (!currentUser) {
      alert("Пользователь не авторизован");
      return;
    }

    try {
      const newId = generateIdFromName(trimmed);
      const newCat = { id: newId, name: trimmed, userId: currentUser.uid };

      await addDoc(collection(db, "categories"), {
        id: newId,
        name: trimmed,
        userId: currentUser.uid,
      });

      setCategories([...categories, newCat]);
      setNewCategoryName("");
      setCategory(newId);
    } catch (error) {
      console.error("Ошибка добавления категории:", error);
    }
  };

  const openDescriptionModal = (description) => {
    setModalDescription(description || "Нет описания");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalDescription("");
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory === "all") {
      return task.status !== "completed";
    } else if (selectedCategory === "completed") {
      return task.status === "completed";
    } else {
      return task.categoryId === selectedCategory && task.status !== "completed";
    }
  });

  return (
    <div style={styles.container}>
      <CategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        addCategory={addCategory}
      />

      <div style={styles.main}>
        <TaskForm
          taskInput={taskInput}
          setTaskInput={setTaskInput}
          descriptionInput={descriptionInput}
          setDescriptionInput={setDescriptionInput}
          endDate={endDate}
          setEndDate={setEndDate}
          priority={priority}
          setPriority={setPriority}
          categories={categories}
          category={category}
          setCategory={setCategory}
          handleAddTask={handleAddTask} // Передаем handleAddTask как пропс
          friends={friends}
          selectedFriends={selectedFriends}
          setSelectedFriends={setSelectedFriends}
          notificationType={notificationType}
          setNotificationType={setNotificationType}
          notificationDate={notificationDate}
          setNotificationDate={setNotificationDate}
          notificationInterval={notificationInterval}
          setNotificationInterval={setNotificationInterval}
          notificationDailyTime={notificationDailyTime}
          setNotificationDailyTime={setNotificationDailyTime}
          notificationTrigger={notificationTrigger}
          setNotificationTrigger={setNotificationTrigger}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />

        <TaskList
          tasks={filteredTasks}
          editingTaskId={editingTaskId}
          editTaskData={editTaskData}
          setEditTaskData={setEditTaskData}
          categoryPickerVisible={categoryPickerVisible}
          setCategoryPickerVisible={setCategoryPickerVisible}
          categories={categories}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          saveEditing={saveEditing}
          handleDeleteTask={handleDeleteTask}
          handleTogglePriority={handleTogglePriority}
          handleCompleteTask={handleCompleteTask}
          openDescriptionModal={openDescriptionModal}
          styles={styles}
        />
      </div>

       {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Описание задачи</h3>
            <p>{modalDescription}</p>
            <button onClick={closeModal} style={styles.closeModalButton}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const styles = {
  container: {
    display: "flex",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "32px",
    gap: "32px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  main: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "16px",
    width: "500px",
    maxWidth: "90%",
    boxSizing: "border-box",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    position: "relative",
  },
  buttonBase: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 600,
  },
  primaryButton: {
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(59, 130, 246, 0.3)",
    },
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    ":hover": {
      backgroundColor: "#cbd5e1",
    },
  },
  dangerButton: {
    background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    color: "#fff",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(239, 68, 68, 0.3)",
    },
  },
  iconButton: {
    padding: "8px",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    padding: "8px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    ":hover": {
      backgroundColor: "#e2e8f0",
    },
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    justifyContent: "flex-end",
  },
  modalText: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#475569",
    whiteSpace: "pre-wrap",
  },
  modalHeader: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "#1e293b",
  },
};

export default TaskManager;
