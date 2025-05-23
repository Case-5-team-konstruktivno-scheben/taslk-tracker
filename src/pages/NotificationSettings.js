import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

registerLocale("ru", ru);

const intervalOptions = [
  { value: "1h", label: "Каждый час" },
  { value: "3h", label: "Каждые 3 часа" },
  { value: "6h", label: "Каждые 6 часов" },
  { value: "12h", label: "Каждые 12 часов" },
  { value: "24h", label: "Каждые 24 часа" },
];

const notificationTypes = [
  { value: "never", label: "Никогда" },
  { value: "once", label: "Один раз" },
  { value: "interval", label: "С интервалом" },
  { value: "daily", label: "Каждый день" },
  { value: "trigger", label: "По триггеру" },
];

const NotificationSettings = ({
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
}) => {
  const [tasksList, setTasksList] = useState([]);
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snap = await getDocs(collection(db, 'tasks'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasksList(data);
      } catch (err) {
        console.error('Ошибка загрузки задач для триггера:', err);
      }
    };
    if (notificationType === 'trigger') fetchTasks();
  }, [notificationType]);

  const fieldStyle = {
    padding: "6px 10px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
    minWidth: "120px",
    cursor: 'pointer'
  };
  const labelStyle = { fontWeight: 600, marginRight: "8px" };
  const rowStyle = { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "10px" };
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
  };
  const modalStyle = {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px', width: '400px', maxHeight: '80vh', overflowY: 'auto',
    boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
  };
  const itemStyle = { padding: '8px 12px', borderBottom: '1px solid #eaeaea', cursor: 'pointer' };

  return (
    <div style={rowStyle}>
      <span style={labelStyle}>Уведомление:</span>
      <select
        value={notificationType}
        onChange={e => setNotificationType(e.target.value)}
        style={fieldStyle}
      >
        {notificationTypes.map(nt => (
          <option key={nt.value} value={nt.value}>{nt.label}</option>
        ))}
      </select>

      {notificationType === "once" && (
        <>
          <span style={labelStyle}>Дата и время:</span>
          <DatePicker
            selected={notificationDate}
            onChange={setNotificationDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd.MM.yyyy HH:mm"
            locale="ru"
            placeholderText="Выберите дату и время"
            className="react-datepicker__input-text"
            style={fieldStyle}
            popperPlacement="bottom-start"
          />
        </>
      )}

      {notificationType === "interval" && (
        <>
          <span style={labelStyle}>Интервал:</span>
          <select
            value={notificationInterval || ""}
            onChange={e => setNotificationInterval(e.target.value)}
            style={fieldStyle}
          >
            <option value="">-- Выберите интервал --</option>
            {intervalOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </>
      )}

      {notificationType === "daily" && (
        <>
          <span style={labelStyle}>Время:</span>
          <DatePicker
            selected={notificationDailyTime}
            onChange={setNotificationDailyTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Время"
            dateFormat="HH:mm"
            locale="ru"
            placeholderText="Выберите время"
            className="react-datepicker__input-text"
            style={fieldStyle}
            popperPlacement="bottom-start"
          />
        </>
      )}

      {notificationType === "trigger" && (
        <>
          <div
            style={fieldStyle}
            onClick={() => setShowTriggerModal(true)}
          >
            {notificationTrigger
              ? `По окончании: ${tasksList.find(t => t.id === notificationTrigger)?.task}`
              : 'Выберите задачу'}
          </div>

          {showTriggerModal && (
            <div style={overlayStyle} onClick={() => setShowTriggerModal(false)}>
              <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h3>Выберите задачу для триггера</h3>
                {tasksList.map(t => (
                  <div
                    key={t.id}
                    style={itemStyle}
                    onClick={() => {
                      setNotificationTrigger(t.id);
                      setShowTriggerModal(false);
                    }}
                  >
                    По окончании: {t.task}
                  </div>
                ))}
                <button
                  onClick={() => setShowTriggerModal(false)}
                  style={{ ...fieldStyle, marginTop: '10px' }}
                >Закрыть</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationSettings;



