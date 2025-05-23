import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Modal, Button } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('ru', ru);

const TaskManagerUser = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("Все задачи");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTaskDescription, setSelectedTaskDescription] = useState("");
  const [openCalendarTaskId, setOpenCalendarTaskId] = useState(null);
  const [notificationInterval, setNotificationInterval] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Получаем все категории и сохраняем их в объект для быстрого доступа по ID
      const categoriesRef = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = categoriesSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name; // Сохраняем название категории по ID
        return acc;
      }, {});
      setCategories(categoriesData);

      // Получаем все задачи
      const tasksRef = collection(db, "tasks");
      const q = selectedCategory === "Все задачи"
        ? query(tasksRef, where("assignedTo", "==", currentUser.uid))
        : query(
            tasksRef,
            where("assignedTo", "==", currentUser.uid),
            where("categoryId", "==", selectedCategory) // Используем categoryId для фильтрации
          );

      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        notificationType: doc.data().notificationType || "",
        notificationDate: doc.data().notificationDate 
          ? new Date(doc.data().notificationDate)
          : null,
        notificationInterval: doc.data().notificationInterval || "",
        categoryId: doc.data().categoryId || "Без категории", // Получаем categoryId
      }));

      // Преобразуем categoryId в название категории
      setTasks(tasksData.map(task => ({
        ...task,
        category: categoriesData[task.categoryId] || "Без категории" // Заменяем categoryId на название
      })));
    };

    fetchData();
  }, [currentUser.uid, selectedCategory, categories]);

  const handleCompleteTask = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: "Завершена" });
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "Завершена" } : task
    ));
  };

  const handleOpenDescription = (description) => {
    setSelectedTaskDescription(description);
    setShowDescriptionModal(true);
  };

  const handleCloseDescription = () => {
    setShowDescriptionModal(false);
    setSelectedTaskDescription("");
  };

  const handleSaveNotificationSettings = async (
    taskId,
    notificationType,
    notificationDate,
    notificationInterval
  ) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      notificationType,
      notificationDate: notificationDate ? notificationDate.toISOString() : null,
      notificationInterval
    });

    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, notificationType, notificationDate, notificationInterval }
        : task
    ));
  };

  const handleNotificationChange = (taskId, newNotificationType) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, notificationType: newNotificationType } : task
    );
    setTasks(updatedTasks);
    handleSaveNotificationSettings(taskId, newNotificationType, null, null);
  };

  const handleDateChange = (taskId, date) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, notificationDate: date } : task
    );
    setTasks(updatedTasks);
    handleSaveNotificationSettings(taskId, "once", date, null);
    setOpenCalendarTaskId(null);
  };

  const handleIntervalChange = (taskId, interval) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, notificationInterval: interval } : task
    );
    setTasks(updatedTasks);
    handleSaveNotificationSettings(taskId, "interval", null, interval);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", width: "100%" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "30px", color: "#2c3e50" }}>
        Управление задачами
      </h1>

      <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
        <label style={{ fontSize: "16px", fontWeight: "500" }}>Фильтр по категории:</label>
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
          style={{
            padding: "10px 15px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            width: "250px",
            backgroundColor: "#fff"
          }}
        >
          <option value="Все задачи">Все категории</option>
          {Object.entries(categories).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
        {tasks.length === 0 ? (
          <div style={{ 
            padding: "20px", 
            textAlign: "center", 
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px dashed #ddd"
          }}>
            Нет задач для отображения
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              style={{
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                width: "100%",
                position: "relative"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "15px"
              }}>
                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  color: "#34495e",
                  margin: 0
                }}>
                  {task.task}
                </h3>
                <span style={{ 
                  fontSize: "12px", 
                  backgroundColor: task.status === "Завершена" ? "#2ecc71" : "#e74c3c",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "20px"
                }}>
                  {task.status}
                </span>
              </div>

              {/* Отображаем категорию */}
              <div style={{ fontSize: "14px", color: "#7f8c8d", marginBottom: "10px" }}>
                <strong>Категория: </strong>{task.category}
              </div>

              <div style={{ display: "flex", gap: "20px", width: "100%", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "20px", fontSize: "14px", flex: 1 }}>
                  <div>
                    <span style={{ color: "#7f8c8d" }}>Создана: </span>
                    {task.creationDate}
                  </div>
                  <div>
                    <span style={{ color: "#7f8c8d" }}>Дедлайн: </span>
                    {task.endDate}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px", alignItems: "center", flex: 1 }}>
                  <button
                    onClick={() => handleOpenDescription(task.description)}
                    style={{
                      backgroundColor: "#3498db",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Описание
                  </button>

                  {/* Блок уведомлений */}
                  <div style={{ position: "relative", flex: 1 }}>
                    <select
                      value={task.notificationType || ""}
                      onChange={(e) => handleNotificationChange(task.id, e.target.value)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        border: "1px solid #bdc3c7",
                        borderRadius: "6px",
                        backgroundColor: "#fff",
                        width: "100%"
                      }}
                    >
                      <option value="">Уведомления</option>
                      <option value="never">Не уведомлять</option>
                      <option value="once">Однократно</option>
                      <option value="interval">Повторять</option>
                    </select>

                    {task.notificationType === "once" && (
                      <div style={{ marginTop: "10px", width: "100%" }}>
                        <DatePicker
                          selected={task.notificationDate}
                          onChange={(date) => handleDateChange(task.id, date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="dd.MM.yyyy HH:mm"
                          locale="ru"
                          open={openCalendarTaskId === task.id} // Открытие календаря только для этой задачи
                          onClickOutside={() => setOpenCalendarTaskId(null)}
                          onSelect={() => setOpenCalendarTaskId(null)}
                          customInput={
                            <input
                              type="text"
                              value={
                                task.notificationDate
                                  ? format(task.notificationDate, 'dd.MM.yyyy HH:mm')
                                  : 'Нажмите для выбора даты'
                              }
                              readOnly
                              onClick={() => setOpenCalendarTaskId(task.id)} // При клике открывается календарь
                              style={{
                                padding: "8px 12px",
                                border: "1px solid #bdc3c7",
                                borderRadius: "6px",
                                width: "100%",
                                cursor: "pointer",
                                backgroundColor: "#fff"
                              }}
                            />
                          }
                        />
                      </div>
                    )}

                    {task.notificationType === "interval" && (
                      <select
                        value={task.notificationInterval}
                        onChange={(e) => handleIntervalChange(task.id, e.target.value)}
                        style={{
                          padding: "8px 12px",
                          fontSize: "14px",
                          border: "1px solid #bdc3c7",
                          borderRadius: "6px",
                          backgroundColor: "#fff",
                          width: "100%",
                          marginTop: "10px"
                        }}
                      >
                        <option value="">Интервал повтора</option>
                        <option value="1h">Каждый час</option>
                        <option value="3h">Каждые 3 часа</option>
                        <option value="6h">Каждые 6 часов</option>
                        <option value="12h">Каждые 12 часов</option>
                      </select>
                    )}
                  </div>
                </div>

                {task.status !== "Завершена" && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    style={{
                      backgroundColor: "#27ae60",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      ":hover": {
                        backgroundColor: "#219a52"
                      }
                    }}
                  >
                    Завершить
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showDescriptionModal} onHide={handleCloseDescription}>
        <Modal.Header closeButton>
          <Modal.Title>Полное описание задачи</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ 
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            fontSize: "15px"
          }}>
            {selectedTaskDescription || "Описание отсутствует"}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseDescription}
            style={{ padding: "8px 20px" }}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskManagerUser;
