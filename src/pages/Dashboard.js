import React, { useState, useEffect } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadTasks(user.uid);
      } else {
        setCurrentUser(null);
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadTasks = async (userId) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const tasksData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedTasks = tasksData.sort((a, b) => {
      const statusOrder = ["Закрытая", "Открытая", "Завершенная"];
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });

    setTasks(sortedTasks);
  };

  const handleSaveTask = async (task) => {
    try {
      if (!currentUser) return;

      if (editTask) {
        const taskRef = doc(db, "tasks", editTask.id);
        await updateDoc(taskRef, task);
      } else {
        await addDoc(collection(db, "tasks"), {
          ...task,
          status: "Закрытая",
          userId: currentUser.uid,
        });
      }

      loadTasks(currentUser.uid);
      setShowForm(false);
      setEditTask(null);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      if (currentUser) loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  const handleStartTask = async (task) => {
    try {
      if (task.status === "Закрытая") {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, { status: "Открытая" });
        if (currentUser) loadTasks(currentUser.uid);
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса задачи:", error);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { status: "Завершенная" });
      if (currentUser) loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка при завершении задачи:", error);
    }
  };

  const handleCloseTask = async (task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { status: "Закрытая" });
      if (currentUser) loadTasks(currentUser.uid);
    } catch (error) {
      console.error("Ошибка при закрытии задачи:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Ваши задачи</h2>

      {!currentUser ? (
        <Alert variant="warning" className="mt-4">
          🔒 Вы не авторизованы. Пожалуйста, <strong>войдите</strong> в аккаунт, чтобы видеть и создавать задачи.
        </Alert>
      ) : (
        <>
          <Button
            onClick={() => {
              setEditTask(null);
              setShowForm(true);
            }}
            variant="primary"
            className="mb-3 cta-button"
          >
            Создать задачу
          </Button>
          <TaskList
            tasks={tasks}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
              setEditTask(task);
              setShowForm(true);
            }}
            onStart={handleStartTask}
            onClose={handleCloseTask}
            onComplete={handleCompleteTask}
          />
          <TaskForm
            show={showForm}
            onHide={() => setShowForm(false)}
            onSave={handleSaveTask}
            editTask={editTask}
            onDelete={handleDeleteTask}
          />
        </>
      )}
    </Container>
  );
}

export default Dashboard;
