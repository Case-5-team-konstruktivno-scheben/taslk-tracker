// src/components/TaskItem.js
import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import NotificationSettings from "../NotificationSettings";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Добавляем кастомные стили для календаря
const CalendarStyles = () => (
  <style>
    {`
      .react-datepicker {
        width: 330px !important;
        font-family: inherit;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .react-datepicker__header {
        background-color: #f9f9f9;
        border-bottom: 1px solid #e0e0e0;
        border-radius: 12px 12px 0 0;
        padding: 10px 0;
      }

      .react-datepicker__month-container {
        width: 100%;
        padding: 0 6px;
      }

      .react-datepicker__day-names {
        display: flex;
        justify-content: space-between;
        margin: 0;
      }

      .react-datepicker__day-name {
        width: 28px;
        line-height: 28px;
        margin: 0;
        color: #666;
        font-weight: 500;
        font-size: 12px;
      }

      .react-datepicker__month {
        margin: 0;
      }

      .react-datepicker__week {
        display: flex;
        justify-content: space-between;
      }

      .react-datepicker__day {
        width: 28px;
        line-height: 28px;
        margin: 1px 0;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-size: 13px;
      }

      .react-datepicker__day:hover {
        background-color: #f0f0f0;
      }

      .react-datepicker__day--selected {
        background-color: #007bff;
        color: white;
      }

      .react-datepicker__time-container {
        width: 90px;
        border-left: 1px solid #e0e0e0;
      }

      .react-datepicker__time-box {
        width: 100% !important;
      }

      .react-datepicker__time-list {
        height: 260px !important;
        overflow-y: auto;
      }

      .react-datepicker__time-list-item {
        padding: 6px 8px;
        height: auto;
        line-height: 1.4;
        font-size: 13px;
      }

      .react-datepicker__time-list-item--selected {
        background-color: #007bff;
        color: white;
      }

      .react-datepicker__time-list-item:hover {
        background-color: #f0f0f0;
      }

      .react-datepicker__navigation {
        top: 8px;
      }

      .react-datepicker__current-month {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      /* Позиционирование */
      .react-datepicker-popper {
        z-index: 2100 !important;
        max-width: 100% !important;
        max-height: 70vh !important;
        overflow: auto !important;
        inset: auto !important;
      }

      .react-datepicker-popper[data-placement^="top"] {
        margin-bottom: 8px !important;
      }

      .react-datepicker-popper[data-placement^="bottom"] {
        margin-top: 8px !important;
      }
    `}
  </style>
);

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
    maxWidth: "100%",
    padding: "12px 15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    ":hover": {
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      transform: "translateY(-2px)",
    },
  },

  modalWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    position: "fixed",
    top: "20px",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 2000,
    backdropFilter: "blur(3px)",
    transition: "opacity 0.3s ease",
    overflowY: "auto",
  },

  modal: {
    position: "relative",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1300px",
    maxHeight: "90vh",
    boxSizing: "border-box",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
    overflowY: "auto",
    transition: "all 0.3s ease",
    margin: "20px 0",
  },

  editContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },

  taskNameEdit: {
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 0.25rem rgba(0, 123, 255, 0.25)",
    },
  },

  textareaDescriptionEdit: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    height: "120px",
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 0.25rem rgba(0, 123, 255, 0.25)",
    },
  },

  datePickerWrapper: {
    width: "100%",
    position: "relative",
  },

  datePickerInput: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease",
    ":focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 0.25rem rgba(0, 123, 255, 0.25)",
    },
  },

  categoryButton: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#e9e9e9",
    },
  },

  buttonsRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },

  actionButton: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },

  saveButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    ":hover": {
      backgroundColor: "#218838",
    },
  },

  cancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    ":hover": {
      backgroundColor: "#5a6268",
    },
  },

  deleteButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    ":hover": {
      backgroundColor: "#c82333",
    },
  },

  inputDate: {
    padding: "8px 12px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    width: "160px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },

  descriptionButton: {
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    fontSize: "14px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#007bff",
      color: "#fff",
      borderColor: "#007bff",
    },
  },

  statusInput: {
    padding: "8px 12px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    minWidth: "120px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
    cursor: "pointer"
  },

  categoryInput: {
    padding: "8px 12px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    minWidth: "120px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },

  notificationTypeBadge: {
    padding: "8px 12px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
    minWidth: "160px",
    textAlign: "center",
  },

  editButton: {
    padding: "8px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#0056b3",
      transform: "translateY(-2px)",
    },
  },

  priority: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#ffd700",
    },
  },

  priorityActive: {
    backgroundColor: "#ffd700",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
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
    padding: "8px 0",  
    background: "#fff",  
    borderRadius: "12px",  
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",  
    border: "1px solid #e0e0e0",
  },

  categoryItem: {
    padding: "10px 15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#f5f5f5",
    },
  },

  noCategories: {
    padding: "10px 15px",
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
    transition: "opacity 0.3s ease",
  },

  descriptionModalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "25px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "70vh",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    overflowY: "auto",
    transition: "all 0.3s ease",
  },

  descriptionModalHeader: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
  },

  descriptionModalText: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "4px solid #007bff",
    marginBottom: "20px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
  },

  descriptionModalCloseButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#333",  
      transform: "rotate(90deg)",  
    },
  },

  descriptionModalActionButton: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#0056b3",
      transform: "translateY(-2px)",
    },
  },

  deleteModalButton: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#dc3545",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#c82333",
      transform: "translateY(-2px)",
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
  handleToggleStatus,
  role,
  currentUser
}) => {
  const isEditing = editingTaskId === task.id;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [recipientUsers, setRecipientUsers] = useState([]);

  const handleOpenRecipientsModal = () => setShowRecipientsModal(true);
  const handleCloseRecipientsModal = () => setShowRecipientsModal(false);

  const recipients = task.assignedTo
    ? Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo]
    : [];

  // Подгружаем fullName и email для каждого получателя
  useEffect(() => {
    if (recipients.length) {
      Promise.all(
        recipients.map(async (uid) => {
          const snap = await getDoc(doc(db, "users", uid));
          return snap.exists() ? { id: uid, ...snap.data() } : null;
        })
      ).then((users) => {
        setRecipientUsers(users.filter(Boolean));
      });
    } else {
      setRecipientUsers([]);
    }
  }, [recipients]);

  if (
    role !== "admin" &&
    task.visibility === "private" &&
    (!currentUser ||
      (task.createdBy !== currentUser.uid &&
        (!Array.isArray(task.assignedTo)
          ? task.assignedTo === currentUser.uid
          : task.assignedTo.includes(currentUser.uid))))
  ) {
    return null;
  }

  const categoryObj = categories.find((cat) => cat.id === task.categoryId);
  const categoryName = categoryObj ? categoryObj.name : "Без категории";

  const toggleCategoryPicker = () => setCategoryOpen((o) => !o);
  const handleMouseLeave = () => {
    setCategoryOpen(false);
    setStatusOpen(false);
  };

  const handleOpenDescriptionModal = (desc) => {
    setModalDescription(desc);
    setShowDescriptionModal(true);
  };
  const handleCloseDescriptionModal = () => setShowDescriptionModal(false);

  return (
    <div style={localStyles.task}>
      <CalendarStyles />

      {!isEditing && (
        <>
          <input
            type="text"
            value={task.task}
            readOnly
            style={{
              width: "140px",
              border: "none",
              background: "transparent",
              fontWeight: "500",
              fontSize: "14px",
            }}
          />
          <button
            onClick={() => handleOpenDescriptionModal(task.description)}
            style={localStyles.descriptionButton}
          >
            Описание
          </button>
          <button
            onClick={handleOpenRecipientsModal}
            style={localStyles.descriptionButton}
          >
            Адресаты
          </button>
          <input
            type="text"
            value={
              task.endDate
                ? new Date(task.endDate).toLocaleString("ru-RU")
                : ""
            }
            readOnly
            style={localStyles.inputDate}
          />

          {/* Плашка статуса убрана из режима просмотра */}

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
            style={
              task.priority
                ? localStyles.priorityActive
                : localStyles.priority
            }
          >
            ★
          </button>
          <button
            onClick={() => handleCompleteTask(task.id)}
            style={{ ...localStyles.editButton, backgroundColor: "#28a745" }}
          >
            Завершить
          </button>
          <button
            onClick={() => startEditing(task)}
            style={localStyles.editButton}
          >
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
                  setEditTaskData({
                    ...editTaskData,
                    description: e.target.value,
                  })
                }
                style={localStyles.textareaDescriptionEdit}
                placeholder="Описание задачи"
              />

              <div style={localStyles.datePickerWrapper}>
                <DatePicker
                  selected={
                    editTaskData.endDate
                      ? new Date(editTaskData.endDate)
                      : null
                  }
                  onChange={(date) =>
                    setEditTaskData({ ...editTaskData, endDate: date })
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  locale="ru"
                  placeholderText="Выберите дату и время"
                  className="react-datepicker__input-text"
                  customInput={<input style={localStyles.datePickerInput} />}
                  calendarClassName="calendar-custom"
                  popperClassName="popper-custom"
                  placement="top"
                  dropdownMode="select"
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                />
              </div>

              {/* Блок смены статуса */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setStatusOpen((o) => !o)}
                  style={localStyles.statusInput}
                >
                  {editTaskData.status === "open" ? "Открытая" : "Закрытая"}{" "}
                  <span style={{ fontSize: "12px" }}>▼</span>
                </button>
                {statusOpen && (
                  <div
                    onMouseLeave={handleMouseLeave}
                    style={localStyles.categoryDropdown}
                  >
                    {["open", "closed"].map((s) => {
                      const isSel = editTaskData.status === s;
                      return (
                        <div
                          key={s}
                          onClick={() => {
                            setEditTaskData({
                              ...editTaskData,
                              status: s,
                            });
                            setStatusOpen(false);
                          }}
                          style={{
                            ...localStyles.categoryItem,
                            backgroundColor: isSel
                              ? "#007bff"
                              : "transparent",
                            color: isSel ? "#fff" : "#000",
                            fontWeight: isSel ? "500" : "normal",
                          }}
                        >
                          {s === "open" ? "Открытая" : "Закрытая"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={toggleCategoryPicker}
                  style={localStyles.categoryButton}
                >
                  {categories.find(
                    (cat) => cat.id === editTaskData.categoryId
                  )?.name || "Без категории"}{" "}
                  <span style={{ fontSize: "12px" }}>▼</span>
                </button>

                {categoryOpen && (
                  <div
                    onMouseLeave={handleMouseLeave}
                    style={localStyles.categoryDropdown}
                  >
                    {categories.length === 0 && (
                      <div style={localStyles.noCategories}>
                        Нет категорий
                      </div>
                    )}
                    {categories.map((cat) => {
                      const isSel = editTaskData.categoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setEditTaskData({
                              ...editTaskData,
                              categoryId: cat.id,
                            });
                            setCategoryOpen(false);
                          }}
                          style={{
                            ...localStyles.categoryItem,
                            backgroundColor: isSel
                              ? "#007bff"
                              : "transparent",
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
              </div>

              <div style={localStyles.notificationSettings}>
                <NotificationSettings
                  notificationType={editTaskData.notificationType}
                  setNotificationType={(val) =>
                    setEditTaskData((prev) => ({
                      ...prev,
                      notificationType: val,
                    }))
                  }
                  notificationDate={editTaskData.notificationDate}
                  setNotificationDate={(val) =>
                    setEditTaskData((prev) => ({
                      ...prev,
                      notificationDate: val,
                    }))
                  }
                  notificationInterval={editTaskData.notificationInterval}
                  setNotificationInterval={(val) =>
                    setEditTaskData((prev) => ({
                      ...prev,
                      notificationInterval: val,
                    }))
                  }
                  notificationDailyTime={editTaskData.notificationDailyTime}
                  setNotificationDailyTime={(val) =>
                    setEditTaskData((prev) => ({
                      ...prev,
                      notificationDailyTime: val,
                    }))
                  }
                  notificationTrigger={editTaskData.notificationTrigger}
                  setNotificationTrigger={(val) =>
                    setEditTaskData((prev) => ({
                      ...prev,
                      notificationTrigger: val,
                    }))
                  }
                />
              </div>
            </div>

            <div style={localStyles.buttonsRow}>
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{
                  ...localStyles.actionButton,
                  ...localStyles.deleteButton,
                }}
              >
                Удалить
              </button>
              <button
                onClick={cancelEditing}
                style={{
                  ...localStyles.actionButton,
                  ...localStyles.cancelButton,
                }}
              >
                Отмена
              </button>
              <button
                onClick={saveEditing}
                style={{
                  ...localStyles.actionButton,
                  ...localStyles.saveButton,
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка описания */}
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
            <h3 style={localStyles.descriptionModalHeader}>
              Описание задачи
            </h3>
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

      {/* Модалка адресатов с fullName и email */}
      {showRecipientsModal && (
        <div
          style={localStyles.descriptionModalOverlay}
          onClick={handleCloseRecipientsModal}
        >
          <div
            style={localStyles.descriptionModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseRecipientsModal}
              style={localStyles.descriptionModalCloseButton}
            >
              ×
            </button>
            <h3 style={localStyles.descriptionModalHeader}>Адресаты</h3>
            <div style={localStyles.descriptionModalText}>
              {recipientUsers.length > 0 ? (
                <ul>
                  {recipientUsers.map((user) => (
                    <li key={user.id}>
                      {user.fullName} ({user.email})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет адресатов</p>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCloseRecipientsModal}
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




