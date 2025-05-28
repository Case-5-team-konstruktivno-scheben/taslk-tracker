import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Пример входных данных: список категорий и список задач для зависимостей
// В вашем коде подставьте реальные стейты categories, tasksList и функцию onAddTask
const categories = [
  { id: 'cat1', name: 'Работа' },
  { id: 'cat2', name: 'Учёба' },
];
const tasksList = [
  { id: 't1', title: 'Сдать отчёт' },
  { id: 't2', title: 'Подготовить презентацию' },
];

const TaskCreationMenu = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dependencies, setDependencies] = useState([]);

  const descRef = useRef(null);

  // Авто-размер textarea по содержимому
  useEffect(() => {
    const ta = descRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [description]);

  const handleSubmit = e => {
    e.preventDefault();
    onAddTask({ title, description, categoryId, dueDate, dependencies });
    // Сброс полей
    setTitle('');
    setDescription('');
    setCategoryId('');
    setDueDate(null);
    setDependencies([]);
  };

  const containerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '2rem',
    maxWidth: '800px',
    margin: '2rem auto',
    borderRadius: '24px',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
    border: '1px solid rgba(241, 245, 249, 0.8)',
    backdropFilter: 'blur(8px)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Новая задача</h2>

      {/* Заголовок */}
      <input
        type="text"
        placeholder="Название задачи"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        style={inputStyle}
      />

      {/* Описание авто-ростом */}
      <textarea
        ref={descRef}
        placeholder="Описание (необязательно)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{
          ...inputStyle,
          resize: 'none',
          overflow: 'hidden',
          minHeight: '80px',
          lineHeight: '1.4',
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {/* Категория */}
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px' }}
        >
          <option value="">Без категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Дедлайн */}
        <div style={{ flex: '1 1 200px' }}>
          <DatePicker
            selected={dueDate}
            onChange={setDueDate}
            placeholderText="Выбрать дедлайн"
            className="react-datepicker__input-text"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Мульти-селект зависимостей */}
      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
        Зависит от
      </label>
      <select
        multiple
        value={dependencies}
        onChange={e => {
          const opts = Array.from(e.target.options)
            .filter(o => o.selected)
            .map(o => o.value);
          setDependencies(opts);
        }}
        style={{
          ...inputStyle,
          height: 'auto',
          minHeight: '100px',
        }}
      >
        {tasksList.map(t => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      {/* Кнопка отправки */}
      <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
        <button type="submit" style={buttonStyle}>
          <FiPlus /> Добавить задачу
        </button>
      </div>
    </form>
  );
};

export default TaskCreationMenu;
