import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { Modal, Button, Card, Form, Row, Col } from "react-bootstrap";
import TaskList from "./admin/TaskList";

const Kollegy = () => {
  const [colleagues, setColleagues] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);

  // Поля формы
  const [taskInput, setTaskInput] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [notificationType, setNotificationType] = useState("never");
  const [notificationDate, setNotificationDate] = useState("");
  const [notificationInterval, setNotificationInterval] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Флаг для контроля отображения задач на экране
  const [tasksVisible, setTasksVisible] = useState(false);

  useEffect(() => {
    // 1) Загружаем коллег
    const fetchColleagues = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const loaded = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.role !== "admin");
        setColleagues(loaded);
      } catch (err) {
        console.error("Ошибка загрузки коллег:", err);
      }
    };

    // 2) Загружаем категории
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(loaded);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    };

    fetchColleagues();
    fetchCategories();
  }, []);

  const handleShowModal = colleague => {
    setSelectedColleague(colleague);
    setShowModal(true);
    setTasksVisible(false);  // Отключаем отображение задач на основной странице
  };

  const handleCloseModal = () => setShowModal(false);

  const handleCloseTaskView = () => {
    setShowTaskView(false);
    setTasksVisible(false);  // Скрываем задачи после закрытия окна
  };

  const handleAddTaskForColleague = () => {
    setShowTaskForm(true);
    setShowModal(false); // Закрываем текущее окно
  };

  const handleTaskView = async () => {
    setShowModal(false);
    setShowTaskView(true);
    await fetchTasks();  // ждём, чтобы сразу в модалке были данные
  };

  // Новая версия fetchTasks: жёсткий where + doc.id
  const fetchTasks = async () => {
    if (!selectedColleague) return;
    try {
      const q = query(
        collection(db, "tasks"),
        where("assignedTo", "==", selectedColleague.id)
      );
      const snap = await getDocs(q);
      const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(loaded);
      setTasksVisible(true);  // Включаем отображение задач в модальном окне
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskInput || !category || !dueDate) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }
    try {
      await addDoc(collection(db, "tasks"), {
        task: taskInput,
        description,
        category,
        assignedTo: selectedColleague.id,
        createdBy: "currentUser",  // TODO: заменить на реального пользователя
        status: "open",
        notificationType,
        notificationDate,
        notificationInterval,
        dueDate
      });
      // сброс формы
      setTaskInput("");
      setCategory("");
      setDescription("");
      setNotificationType("never");
      setNotificationDate("");
      setNotificationInterval("");
      setDueDate("");
      setShowTaskForm(false);
      // перезагрузим список, чтобы сразу увидеть новую задачу
      await fetchTasks();
      setShowTaskView(true);
    } catch (err) {
      console.error("Ошибка при добавлении задачи:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error("Ошибка при удалении задачи:", err);
    }
  };

  const handleEditTask = (task) => {
    setTaskInput(task.task);
    setDescription(task.description);
    setCategory(task.category);
    setNotificationType(task.notificationType);
    setNotificationDate(task.notificationDate);
    setNotificationInterval(task.notificationInterval);
    setDueDate(task.dueDate);
    setShowTaskForm(true);
    setShowTaskView(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: "20px" }}>Коллеги</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {colleagues.map(col => (
          <Card
            key={col.id}
            style={{
              width: 200,
              padding: 15,
              cursor: "pointer",
              borderRadius: 15,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform .3s, box-shadow .3s",
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff"
            }}
            onClick={() => handleShowModal(col)}
          >
            <Card.Body>
              <Card.Title style={{ fontSize: 18, fontWeight: "bold" }}>
                {col.fullName || col.email}
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: 14 }}>
                {col.role}
              </Card.Subtitle>
              <Card.Text style={{ fontSize: 14 }}>{col.email}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Главное модальное окно */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedColleague?.fullName || selectedColleague?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="primary" onClick={handleAddTaskForColleague} style={styles.modalButton}>
            Добавить задачу
          </Button>{" "}
          <Button variant="secondary" onClick={handleTaskView} style={styles.modalButton}>
            Посмотреть задачи
          </Button>
        </Modal.Body>
      </Modal>

      {/* Форма добавления */}
      <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Добавить задачу для {selectedColleague?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="taskInput">
              <Form.Label>Название задачи</Form.Label>
              <Form.Control
                type="text"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                style={styles.inputField}
              />
            </Form.Group>
            <Row className="mt-3">
              <Col md={8}>
                <Form.Group controlId="description">
                  <Form.Label>Описание (необязательно)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={styles.textareaField}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                {/* Остальные поля */}
                {/* Категория */}
                <Form.Group controlId="category" className="mt-2">
                  <Form.Label>Категория</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="">-- выберите --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {/* Тип уведомления */}
                <Form.Group controlId="notificationType" className="mt-2">
                  <Form.Label>Тип уведомления</Form.Label>
                  <Form.Select
                    value={notificationType}
                    onChange={e => setNotificationType(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="never">Не уведомлять</option>
                    <option value="onDate">На дату</option>
                    <option value="interval">Через интервал</option>
                  </Form.Select>
                </Form.Group>
                {notificationType === "onDate" && (
                  <Form.Group controlId="notificationDate" className="mt-2">
                    <Form.Label>Дата уведомления</Form.Label>
                    <Form.Control
                      type="date"
                      value={notificationDate}
                      onChange={e => setNotificationDate(e.target.value)}
                      style={styles.inputField}
                    />
                  </Form.Group>
                )}
                {notificationType === "interval" && (
                  <Form.Group controlId="notificationInterval" className="mt-2">
                    <Form.Label>Интервал (дней)</Form.Label>
                    <Form.Control
                      type="number"
                      value={notificationInterval}
                      onChange={e => setNotificationInterval(e.target.value)}
                      style={styles.inputField}
                    />
                  </Form.Group>
                )}
                {/* Дата окончания */}
                <Form.Group controlId="dueDate" className="mt-2">
                  <Form.Label>Дата окончания</Form.Label>
                  <Form.Control
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={styles.inputField}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button className="mt-3" onClick={handleTaskSubmit} style={styles.saveButton}>
              Сохранить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Просмотр списка задач */}
      {showTaskView && tasksVisible && (
        <Modal show={showTaskView} onHide={handleCloseTaskView} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Задачи для {selectedColleague?.fullName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tasks.map(task => (
                <Card
                  key={task.id}
                  style={styles.taskCard}
                >
                  <Card.Body>
                    <Card.Title>{task.task}</Card.Title>
                    <Card.Text>{task.description}</Card.Text>
                    <Card.Subtitle className="mb-2 text-muted">Категория: {task.category}</Card.Subtitle>
                    <Card.Text>Дата окончания: {task.dueDate}</Card.Text>
                    <Card.Text>Статус: {task.status}</Card.Text>
                    <div>
                      <Button variant="warning" onClick={() => handleEditTask(task)} style={styles.cardButton}>
                        Редактировать
                      </Button>{" "}
                      <Button variant="danger" onClick={() => handleDeleteTask(task.id)} style={styles.cardButton}>
                        Удалить
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

const styles = {
  modalButton: {
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "16px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    transition: "all 0.3s ease",  // Плавный переход
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.2)",  // Тень
    ":hover": {
      background: "#0056b3",
      transform: "translateY(-2px)",  // Легкое поднятие при наведении
      boxShadow: "0 6px 12px rgba(0, 123, 255, 0.3)",  // Увеличенная тень при наведении
    },
    ":active": {
      transform: "translateY(0)",  // При нажатии кнопка возвращается
      boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",  // Уменьшенная тень при нажатии
    },
  },
  saveButton: {
    padding: "12px 28px",
    borderRadius: "30px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(40, 167, 69, 0.2)",  // Тень
    ":hover": {
      backgroundColor: "#218838",
      transform: "translateY(-2px)",  // Легкое поднятие при наведении
      boxShadow: "0 6px 12px rgba(40, 167, 69, 0.3)",  // Увеличенная тень при наведении
    },
    ":active": {
      transform: "translateY(0)",  // При нажатии кнопка возвращается
      boxShadow: "0 2px 4px rgba(40, 167, 69, 0.2)",  // Уменьшенная тень при нажатии
    },
  },
  inputField: {
    padding: "10px 16px",
    borderRadius: "30px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "100%",
    marginBottom: "15px",
  },
  textareaField: {
    padding: "10px 16px",
    borderRadius: "30px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "100%",
    marginBottom: "15px",
  },
  taskCard: {
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "15px",
    backgroundColor: "#fff",
  },
  cardButton: {
    borderRadius: "30px",
    padding: "8px 18px",
    margin: "5px 0",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.2)",  // Тень
    ":hover": {
      backgroundColor: "#007bff",
      transform: "translateY(-2px)",  // Легкое поднятие при наведении
      boxShadow: "0 6px 12px rgba(0, 123, 255, 0.3)",  // Увеличенная тень при наведении
    },
    ":active": {
      transform: "translateY(0)",  // При нажатии кнопка возвращается
      boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",  // Уменьшенная тень при нажатии
    },
  },
};

export default Kollegy;
