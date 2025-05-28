import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const TaskForm = ({ onSubmit, onCancel, users = [], teamId, currentUser }) => {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [assignedTo, setAssignedTo] = useState(null);
  const [dependencies, setDependencies] = useState([]); // Новое состояние для зависимостей

  const handleAddDependency = (dependencyId) => {
    setDependencies([...dependencies, dependencyId]); // Добавление зависимости
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task || !teamId || !currentUser) return;

    const newTask = {
      teamId,
      task,
      description,
      createdBy: currentUser.uid,
      assignedTo: assignedTo?.value || null,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      status: "open",
      dependencies, // Добавляем зависимость
      createdAt: new Date().toISOString(),
    };

    onSubmit(newTask);
  };

  const userOptions = users.map(u => ({ value: u.id, label: u.fullName || u.email }));

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Создание задачи</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название задачи"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          />

          <label>Крайний срок:</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            dateFormat="Pp"
            style={styles.datepicker}
          />

          <label>Назначить:</label>
          <Select
            options={userOptions}
            value={assignedTo}
            onChange={setAssignedTo}
            isClearable
          />

          <label>
            <input
              type="checkbox"
              checked={priority}
              onChange={() => setPriority(!priority)}
            /> Важная задача
          </label>

          <label>Зависимости:</label>
          <input
            type="text"
            placeholder="Введите ID задачи, от которой зависит эта"
            onChange={(e) => handleAddDependency(e.target.value)}
            style={styles.input}
          />

          <div style={styles.actions}>
            <button type="submit">Создать</button>
            <button type="button" onClick={onCancel}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.3)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: 1000
  },
  modal: {
    backgroundColor: "#fff", padding: "20px", borderRadius: "12px",
    width: "400px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
  },
  input: {
    width: "100%", marginBottom: "1rem", padding: "8px", borderRadius: "8px"
  },
  textarea: {
    width: "100%", height: "80px", padding: "8px", borderRadius: "8px", marginBottom: "1rem"
  },
  actions: {
    display: "flex", justifyContent: "space-between", marginTop: "1rem"
  }
};

export default TaskForm;
