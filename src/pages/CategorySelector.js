import React, { useState } from "react";

const CategorySelector = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  newCategoryName,
  setNewCategoryName,
  addCategory,
  deleteCategory,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Tusk</h2>
      <div style={styles.header}>
        <p style={styles.link}>Категории</p>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          🖉
        </button>
      </div>
      <ul style={styles.categoryList}>
        {/* Дефолтные */}
        <li
          style={{
            ...styles.categoryItem,
            fontWeight: selectedCategory === "all" ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => setSelectedCategory("all")}
        >
          Все задачи
        </li>

        {categories.map((cat) => (
          <li
            key={cat.id}
            style={{
              ...styles.categoryItem,
              fontWeight: selectedCategory === cat.id ? "bold" : "normal",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.name}</span>
            {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat.id);
                }}
                style={styles.deleteButton}
              >
                –
              </button>
            )}
          </li>
        ))}

        {/* Ввод новой категории и кнопка */}
        <li style={{ marginTop: 10, display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Новая категория"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={styles.newCategoryInput}
            onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
          <button
            onClick={addCategory}
            style={styles.addButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            +
          </button>
        </li>

        {/* Завершённые задачи */}
        <li
          style={{
            ...styles.categoryItem,
            fontWeight: selectedCategory === "completed" ? "bold" : "normal",
            cursor: "pointer",
            marginTop: 20,
            borderTop: "1px solid #ccc",
            paddingTop: 10,
          }}
          onClick={() => setSelectedCategory("completed")}
        >
          Завершённые
        </li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: 220,
    borderRight: "1px solid #ddd",
    padding: 20,
    backgroundColor: "#f8f9fa",  // Легкий фон для боковой панели
    borderRadius: "12px",  // Закругленные углы
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",  // Тень для боковой панели
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",  // Сделал заголовок жирным
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
  },
  link: {
    fontWeight: "bold",
    fontSize: 16,
    margin: 0,
    marginRight: 8,
  },
  editButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 4,
    transition: "transform 0.3s ease",  // Плавное движение
    ":hover": {
      transform: "scale(1.1)",  // Легкое увеличение при наведении
    },
  },
  categoryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  categoryItem: {
    padding: "8px 0",
    fontSize: 16,
    transition: "background-color 0.3s ease",  // Плавное изменение фона
    ":hover": {
      backgroundColor: "#f1f1f1",  // Легкое затемнение фона при наведении
    },
  },
  newCategoryInput: {
    width: "150px",  // Сделал поле ввода немного короче
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "30px",  // Круглая форма поля ввода
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    outline: "none",
    transition: "border-color 0.3s",  // Плавный переход для изменения рамки
    ":focus": {
      borderColor: "#4CAF50",  // Зеленая рамка при фокусе
    },
  },
  addButton: {
    cursor: "pointer",
    width: "25px",  // Сделал кнопку меньшей
    height: "25px",  // Сделал кнопку круглой
    borderRadius: "50%",  // Круглая кнопка
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    fontWeight: "bold",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.2)",  // Тень для кнопки
    transition: "background-color 0.3s, transform 0.3s ease",
    ":hover": {
      backgroundColor: "#45a049",  // При наведении кнопка становится темнее
      transform: "scale(1.1)",  // Кнопка немного увеличивается
    },
    ":active": {
      transform: "scale(0.95)",  // При нажатии кнопка немного уменьшается
    },
  },
  deleteButton: {
    cursor: "pointer",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "1px solid #f44336",
    backgroundColor: "#fff",
    color: "#f44336",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    padding: 0,
    transition: "background-color 0.3s, transform 0.3s ease",
    ":hover": {
      backgroundColor: "#f8d7da",  // Легкое выделение при наведении
      transform: "scale(1.1)",  // Легкое увеличение при наведении
    },
    ":active": {
      transform: "scale(0.95)",  // При нажатии кнопка немного уменьшается
    },
  },
};

export default CategorySelector;
