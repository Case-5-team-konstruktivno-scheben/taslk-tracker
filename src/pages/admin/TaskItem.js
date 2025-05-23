import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import NotificationSettings from "../NotificationSettings";

registerLocale("ru", ru);

const notificationTypeLabels = {
  never: "Никогда",
  once: "Один раз",
  interval: "С интервалом",
  daily: "Каждый день",
  trigger: "По триггеру",
};

const localStyles = {
  task: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "0 0 10px 0",
    maxWidth: "800px",
    padding: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "16px",  // Увеличено округление
    backgroundColor: "#fff",
    transition: "all 0.3s ease", // Плавный переход для эффекта при наведении
    ":hover": {
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)", // Эффект тени при наведении
      transform: "translateY(-4px)"  // Легкое поднятие при наведении
    },
  },

  modalWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 2000,
    backdropFilter: "blur(3px)",
    transition: "opacity 0.3s ease", // Плавное появление модального окна
  },

  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "16px", // Увеличено округление
    maxWidth: "1200px",
    width: "90%",
    boxSizing: "border-box",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
    maxHeight: "70vh",
    overflowY: "auto",
    transition: "all 0.3s ease",
  },

  editContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "15px",
    flexWrap: "wrap",
    width: "100%",
  },

  taskNameEdit: {
    padding: "12px 15px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease", // Плавный переход для ввода текста
    ":focus": {
      borderColor: "#007bff",  // Цвет границы при фокусе
      boxShadow: "0 0 6px rgba(0, 123, 255, 0.5)",  // Легкая тень при фокусе
    },
  },

  textareaDescriptionEdit: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    height: "100px",
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease", // Плавный переход
    ":focus": {
      borderColor: "#007bff",  // Цвет границы при фокусе
      boxShadow: "0 0 6px rgba(0, 123, 255, 0.5)",  // Легкая тень при фокусе
    },
  },

  datePickerWrapper: {
    width: "calc(33% - 10px)",
    position: "relative",
  },

  categoryButton: {
    width: "calc(33% - 10px)",
    padding: "12px 15px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    transition: "all 0.3s ease",  // Плавный переход
    ":hover": {
      backgroundColor: "#007bff",
      color: "#fff",
      transform: "translateY(-2px)",  // Легкое поднятие при наведении
    },
  },

  statusButton: {
    padding: "10px 15px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    minWidth: "100px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",  // Плавный переход
    ":hover": {
      backgroundColor: "#007bff",
      color: "#fff",
    },
  },

  buttonsRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: "15px",
    paddingTop: "10px",
    borderTop: "1px solid #eee",
  },

  actionButton: {
    padding: "8px 16px",
    borderRadius: "16px",  // Увеличено округление
    border: "none",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease", // Плавный переход
    ":hover": {
      transform: "scale(1.05)", // Легкое увеличение при наведении
    },
  },

  saveButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    ":hover": {
      backgroundColor: "#218838",  // Цвет при наведении
    },
  },

  cancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    ":hover": {
      backgroundColor: "#5a6268",  // Цвет при наведении
    },
  },

  deleteButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    ":hover": {
      backgroundColor: "#c82333",  // Цвет при наведении
    },
  },

  inputDate: {
    padding: "6px 10px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    width: "120px",
    backgroundColor: "#f9f9f9",
  },

  descriptionButton: {
    padding: "6px 12px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    fontSize: "14px",
    transition: "all 0.3s ease", // Плавный переход
    ":hover": {
      backgroundColor: "#007bff",
      color: "#fff",
    },
  },

  statusInput: {
    padding: "6px 10px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    minWidth: "100px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
    transition: "all 0.3s ease", // Плавный переход
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 6px rgba(0, 123, 255, 0.5)",
    },
  },

  categoryInput: {
    padding: "6px 10px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    minWidth: "100px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },

  notificationTypeBadge: {
    padding: "6px 10px",
    borderRadius: "16px",  // Увеличено округление
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
    minWidth: "160px",
    textAlign: "center",
  },

  editButton: {
    padding: "6px 12px",
    borderRadius: "16px",  // Увеличено округление
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    ":hover": {
      backgroundColor: "#0056b3",  // Цвет при наведении
    },
  },

  priority: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",  // Увеличено округление
    padding: "4px 8px",
    fontSize: "16px",
  },

  priorityActive: {
    backgroundColor: "#ffd700",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",  // Увеличено округление
    padding: "4px 8px",
    fontSize: "16px",
  },

  statusButtonsContainer: {
    display: "flex",
    gap: "10px",
    width: "calc(33% - 10px)",
  },

  notificationSettings: {
    width: "100%",
    marginTop: "10px",
  },

  categoryDropdown: {
    position: "absolute",
    top: "calc(100% + 5px)",
    left: 0,
    zIndex: 1000,
    width: "100%",
    maxWidth: "280px",
    padding: "6px 0",
    background: "#fff",
    borderRadius: "16px",  // Увеличено округление
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  categoryItem: {
    padding: "8px 12px",
    cursor: "pointer",
  },

  noCategories: {
    padding: "8px 12px",
    color: "#999",
    fontStyle: "italic",
  },

  descriptionModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(3px)",
    transition: "opacity 0.3s ease",  // Плавный переход для фона
  },

  descriptionModalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "16px",  // Увеличено округление
    padding: "20px",
    width: "90%",
    maxWidth: "1200px",
    maxHeight: "70vh",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    overflowY: "auto",
    transition: "all 0.3s ease",  // Плавный переход для модального окна
  },

  descriptionModalHeader: {
    marginTop: 0,
    marginBottom: "15px",
    fontSize: "22px",
  },

  descriptionModalText: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid #007bff",
    marginBottom: "20px",
  },

  descriptionModalCloseButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },

  descriptionModalActionButton: {
    padding: "8px 16px",
    borderRadius: "16px",  // Увеличено округление
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease", // Плавный переход
    ":hover": {
      backgroundColor: "#0056b3",
    },
  },
};

const TaskItem = ({
  task,
  editingTaskId,
  editTaskData,
  setEditTaskData,
  categories = [],
  startEditing,
  cancelEditing,
  saveEditing,
  handleDeleteTask,
  handleTogglePriority,
  handleCompleteTask,
}) => {
  const isEditing = editingTaskId === task.id;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [modalDescription, setModalDescription] = useState("");

  const categoryObj = categories.find((cat) => cat.id === task.categoryId);
  const categoryName = categoryObj ? categoryObj.name : "Без категории";

  const toggleCategoryPicker = () => setCategoryOpen((o) => !o);
  const handleMouseLeave = () => setCategoryOpen(false);

  const handleOpenDescriptionModal = (desc) => {
    setModalDescription(desc);
    setShowDescriptionModal(true);
  };
  const handleCloseDescriptionModal = () => setShowDescriptionModal(false);

  return (
    <div style={localStyles.task}>
      {!isEditing && (
        <>
          <input
            type="text"
            value={task.task}
            readOnly
            style={{ width: "140px", border: "none", background: "transparent" }}
          />
          <button
            onClick={() => handleOpenDescriptionModal(task.description)}
            style={localStyles.descriptionButton}
          >
            Описание
          </button>
          <input
            type="text"
            value={task.endDate ? new Date(task.endDate).toLocaleString("ru-RU") : ""}
            readOnly
            style={localStyles.inputDate}
          />
          <input
            type="text"
            value={
              task.status === "completed"
                ? "Завершённая"
                : task.status === "open"
                ? "Открытая"
                : "Закрытая"
            }
            readOnly
            style={localStyles.statusInput}
          />
          <input
            type="text"
            value={categoryName}
            readOnly
            style={localStyles.categoryInput}
          />
          <div style={localStyles.notificationTypeBadge}>
            {notificationTypeLabels[task.notificationType] || "Не задан"}
          </div>
          <button
            onClick={() => handleTogglePriority(task.id)}
            style={task.priority ? localStyles.priorityActive : localStyles.priority}
          >
            ★
          </button>
          <button
            onClick={() => handleCompleteTask(task.id)}
            style={{ ...localStyles.editButton, backgroundColor: "#28a745" }}
          >
            Завершить
          </button>
          <button onClick={() => startEditing(task)} style={localStyles.editButton}>
            Редактировать
          </button>
        </>
      )}

      {isEditing && (
        <div style={localStyles.modalWrapper}>
          <div style={localStyles.modal}>
            <div style={localStyles.editContainer}>
              <input
                type="text"
                value={editTaskData.task}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, task: e.target.value })
                }
                style={localStyles.taskNameEdit}
                placeholder="Название задачи"
              />

              <textarea
                value={editTaskData.description}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, description: e.target.value })
                }
                style={localStyles.textareaDescriptionEdit}
                placeholder="Описание задачи"
              />

              <div style={localStyles.datePickerWrapper}>
                <DatePicker
                  selected={editTaskData.endDate ? new Date(editTaskData.endDate) : null}
                  onChange={(date) =>
                    setEditTaskData({ ...editTaskData, endDate: date })
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  locale="ru"
                  placeholderText="Выберите дату и время"
                  wrapperClassName="date-picker-wrapper"
                  className="react-datepicker__input-text"
                  style={{
                    width: "100%",
                    borderRadius: "16px",  // Увеличено округление
                    border: "1px solid #e0e0e0",
                    padding: "12px 15px",
                    fontSize: "14px",
                    backgroundColor: "#f9f9f9",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={toggleCategoryPicker}
                style={localStyles.categoryButton}
              >
                {categories.find((cat) => cat.id === editTaskData.categoryId)?.name ||
                  "Без категории"}
                <span style={{ fontSize: "12px" }}>▼</span>
              </button>

              {categoryOpen && (
                <div onMouseLeave={handleMouseLeave} style={localStyles.categoryDropdown}>
                  {categories.length === 0 && (
                    <div style={localStyles.noCategories}>Нет категорий</div>
                  )}
                  {categories.map((cat) => {
                    const isSel = editTaskData.categoryId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setEditTaskData({ ...editTaskData, categoryId: cat.id });
                          setCategoryOpen(false);
                        }}
                        style={{
                          ...localStyles.categoryItem,
                          backgroundColor: isSel ? "#007bff" : "transparent",
                          color: isSel ? "#fff" : "#000",
                          fontWeight: isSel ? "500" : "normal",
                        }}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={localStyles.notificationSettings}>
                <NotificationSettings
                  notificationType={editTaskData.notificationType}
                  setNotificationType={(val) =>
                    setEditTaskData((prev) => ({ ...prev, notificationType: val }))
                  }
                  notificationDate={editTaskData.notificationDate}
                  setNotificationDate={(val) =>
                    setEditTaskData((prev) => ({ ...prev, notificationDate: val }))
                  }
                  notificationInterval={editTaskData.notificationInterval}
                  setNotificationInterval={(val) =>
                    setEditTaskData((prev) => ({ ...prev, notificationInterval: val }))
                  }
                  notificationDailyTime={editTaskData.notificationDailyTime}
                  setNotificationDailyTime={(val) =>
                    setEditTaskData((prev) => ({ ...prev, notificationDailyTime: val }))
                  }
                  notificationTrigger={editTaskData.notificationTrigger}
                  setNotificationTrigger={(val) =>
                    setEditTaskData((prev) => ({ ...prev, notificationTrigger: val }))
                  }
                />
              </div>
            </div>

            <div style={localStyles.buttonsRow}>
              <button
                onClick={cancelEditing}
                style={{ ...localStyles.actionButton, ...localStyles.cancelButton }}
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{ ...localStyles.actionButton, ...localStyles.deleteButton }}
              >
                Удалить
              </button>
              <button
                onClick={saveEditing}
                style={{ ...localStyles.actionButton, ...localStyles.saveButton }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showDescriptionModal && (
        <div
          style={localStyles.descriptionModalOverlay}
          onClick={handleCloseDescriptionModal}
        >
          <div
            style={localStyles.descriptionModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseDescriptionModal}
              style={localStyles.descriptionModalCloseButton}
            >
              ×
            </button>
            <h3 style={localStyles.descriptionModalHeader}>Описание задачи</h3>
            <div style={localStyles.descriptionModalText}>
              <p>{modalDescription || "Описание отсутствует"}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCloseDescriptionModal}
                style={localStyles.descriptionModalActionButton}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
