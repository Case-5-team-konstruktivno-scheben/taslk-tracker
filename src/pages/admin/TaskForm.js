import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import NotificationSettings from "../NotificationSettings";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ru", ru);

const TaskForm = ({
  taskInput,
  setTaskInput,
  descriptionInput,
  setDescriptionInput,
  endDate,
  setEndDate,
  priority,
  setPriority,
  categories,
  category,
  setCategory,
  users,
  handleAddTask,
  notificationType,
  setNotificationType,
  notificationDate,
  setNotificationDate,
  notificationInterval,
  setNotificationInterval,
  notificationDailyTime,
  setNotificationDailyTime,
  notificationTrigger,
  setNotificationTrigger,
  selectedUser,
  setSelectedUser,
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const toggleDate = () => setDateOpen((prev) => !prev);
  const toggleCategory = () => setCategoryOpen((prev) => !prev);
  const toggleFriends = () => setFriendsOpen((prev) => !prev);

  const handleTaskSubmit = async () => {
    if (!taskInput || !endDate || !selectedUser) {
      alert("Заполните все поля и выберите пользователя для назначения задачи");
      return;
    }

    try {
      const selectedCategoryObj = categories.find((cat) => cat.id === category);
      const categoryName = selectedCategoryObj ? selectedCategoryObj.name : "";

      const newTask = {
        task: taskInput,
        description: descriptionInput,
        endDate: endDate.toISOString(),
        priority,
        status: "open",
        categoryId: category || "",
        categoryName: categoryName,
        assignedTo: selectedUser,
        createdAt: new Date().toISOString(),
      };

      handleAddTask(newTask);

      setTaskInput("");
      setDescriptionInput("");
      setEndDate(null);
      setPriority(false);
      setCategory("");
      setSelectedUser("");
    } catch (error) {
      console.error("Ошибка добавления задачи:", error);
    }
  };

  return (
    <div style={styles.createBlock}>
      <input
        type="text"
        placeholder="Введите задачу"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        style={styles.inputTask}
      />
      <textarea
        placeholder="Описание задачи (если есть)"
        value={descriptionInput}
        onChange={(e) => setDescriptionInput(e.target.value)}
        style={styles.textareaDescription}
      />

      <div style={{ marginBottom: 10 }}>
        <label htmlFor="userSelect" style={styles.userLabel}>
          Назначить пользователю:
        </label>
        <select
          id="userSelect"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={styles.selectUser}
          required
        >
          <option value="">Выберите пользователя</option>
          {users &&
            users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.email}
              </option>
            ))}
        </select>
      </div>

      <div style={styles.controlsRow}>
        <div style={{ position: "relative" }} onMouseLeave={() => setDateOpen(false)}>
          <button
            type="button"
            onClick={toggleDate}
            style={styles.dateButton}
            title="Выбрать дату и время"
          >
            {endDate
              ? endDate.toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Выбрать дату и время"}{" "}
            ▼
          </button>
          {dateOpen && (
            <div style={styles.datePickerDropdown}>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setDateOpen(false);
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                locale="ru"
                inline
              />
            </div>
          )}
        </div>

        <div style={{ position: "relative" }} onMouseLeave={() => setCategoryOpen(false)}>
          <button
            type="button"
            onClick={toggleCategory}
            style={styles.categoryButton}
            title="Выбрать категорию"
          >
            {category ? categories.find((cat) => cat.id === category)?.name : "Без категории"} ▼
          </button>
          {categoryOpen && (
            <div style={styles.categoryDropdown}>
              {categories.length === 0 && <div style={styles.noCategory}>Нет категорий</div>}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setCategoryOpen(false);
                  }}
                  style={{
                    ...styles.categoryItem,
                    backgroundColor: category === cat.id ? "#007bff" : "transparent",
                    color: category === cat.id ? "#fff" : "#000",
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setPriority(!priority)}
          style={priority ? styles.priorityActive : styles.priority}
          title="Приоритет"
          type="button"
        >
          ★
        </button>

        <button onClick={handleTaskSubmit} style={styles.createButton} type="button">
          <span style={styles.buttonContent}>
            <svg 
              style={styles.plusIcon} 
              viewBox="0 0 24 24" 
              width="20" 
              height="20"
            >
              <path 
                fill="currentColor" 
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              />
            </svg>
            Создать задачу
          </span>
        </button>
      </div>

      <NotificationSettings
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
      />
    </div>
  );
};

const styles = {
  createBlock: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  inputTask: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: 30,
    border: "1px solid #e0e0e0",
    fontSize: 16,
    marginBottom: 12,
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 3px rgba(0,123,255,0.1)",
      outline: "none",
    },
  },
  textareaDescription: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: 15,
    border: "1px solid #e0e0e0",
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.5,
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 3px rgba(0,123,255,0.1)",
      outline: "none",
    },
  },
  userLabel: {
    fontWeight: 500,
    fontSize: 14,
    color: "#495057",
    marginBottom: 6,
    display: "block",
  },
  selectUser: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 30,
    border: "1px solid #e0e0e0",
    fontSize: 14,
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 3px rgba(0,123,255,0.1)",
      outline: "none",
    },
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 16,
  },
  dateButton: {
    cursor: "pointer",
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 30,
    fontSize: 14,
    padding: "10px 18px",
    minWidth: 220,
    textAlign: "left",
    transition: "all 0.3s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ":hover": {
      borderColor: "#007bff",
    },
  },
  datePickerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 1000,
    marginTop: 6,
  },
  categoryButton: {
    cursor: "pointer",
    backgroundColor: "#e7f1ff",
    border: "1px solid #007bff",
    borderRadius: 30,
    fontSize: 14,
    padding: "10px 18px",
    minWidth: 160,
    textAlign: "left",
    fontWeight: 500,
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#d6e4ff",
    },
  },
  categoryDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 1000,
    minWidth: 200,
    padding: "8px 0",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  categoryItem: {
    padding: "10px 16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  noCategory: {
    padding: "10px 16px",
    color: "#6c757d",
    fontSize: 14,
  },
  priority: {
    cursor: "pointer",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: 30,
    fontSize: 16,
    padding: "10px 14px",
    color: "#6c757d",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#e9ecef",
    },
  },
  priorityActive: {
    cursor: "pointer",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffd700",
    borderRadius: 30,
    fontSize: 16,
    padding: "10px 14px",
    color: "#856404",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#ffe69c",
    },
  },
  createButton: {
    padding: "12px 28px",
    borderRadius: 30,
    border: "none",
    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)",
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 12px rgba(0, 123, 255, 0.3)",
      background: "linear-gradient(135deg, #0069d9 0%, #004a9f 100%)",
    },
    ":active": {
      transform: "translateY(0)",
      boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",
    },
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  plusIcon: {
    transition: "transform 0.2s ease",
  },
};

export default TaskForm;