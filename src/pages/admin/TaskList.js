// src/pages/admin/TaskList.js
import React, { useState, useEffect } from "react";
import TaskItem from "./TaskItem";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const TaskList = ({
  tasks,
  editingTaskId,
  editTaskData,
  setEditTaskData,
  categoryPickerVisible,
  setCategoryPickerVisible,
  categories,
  startEditing,
  cancelEditing,
  saveEditing,
  handleDeleteTask,
  handleTogglePriority,
  handleCompleteTask,
  openDescriptionModal,
  styles,
  role,
  currentUser,
  selectedTeamId,       // добавлено
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Переключение статуса open ↔ closed
  const handleToggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
    // Предполагается, что список обновится через onSnapshot или иным образом
  };

  if (!currentUser) {
    return <p>Загрузка...</p>;
  }

  // Сначала отфильтруем по выбранной команде и правам доступа
  const filteredTasks = tasks.filter(task => {
    // 1) только задачи из текущей команды
    if (task.teamId !== selectedTeamId) return false;

    // 2) админ видит всё в своей команде
    if (role === "admin") return true;

    // 3) остальные по правилам canSee
    const canSee =
      (task.visibility === "team" || task.visibility === "public") ||
      (task.assignedTo === currentUser.uid) ||
      (task.createdBy === currentUser.uid);

    return canSee;
  });

  // Затем фильтрация по поиску и выбранной категории
  const filteredAndSearchedTasks = filteredTasks.filter(task => {
    const matchesSearch = task.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? task.categoryName === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const noTasksFound = filteredAndSearchedTasks.length === 0 && searchQuery !== "";

  return (
    <div>
      <div style={{
        marginBottom: "30px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
        padding: "15px 25px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
      }}>
        {/* Поиск */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: "12px 20px 12px 40px",
              fontSize: "15px",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              width: "320px",
              backgroundColor: "#f8fafc",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)"
            }}
          />
          <svg
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              width: "18px",
              height: "18px",
              pointerEvents: "none"
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Селектор категории */}
        <div style={{ position: "relative" }}>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: "12px 20px",
              fontSize: "15px",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              width: "280px",
              backgroundColor: "#f8fafc",
              cursor: "pointer",
              transition: "all 0.3s ease",
              outline: "none",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              backgroundSize: "18px"
            }}
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {noTasksFound && (
        <p style={{
          textAlign: "center",
          color: "#ef4444",
          fontSize: "16px",
          fontWeight: "500",
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fef2f2",
          borderRadius: "10px",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          Задачи не найдены
        </p>
      )}

      <div>
        {filteredAndSearchedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
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
            handleToggleStatus={handleToggleStatus}
            openDescriptionModal={openDescriptionModal}
            styles={styles}
            role={role}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
