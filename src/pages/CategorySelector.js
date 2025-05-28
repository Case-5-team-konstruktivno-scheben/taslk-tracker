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
            {isEditing && typeof deleteCategory === "function" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat.id);
                }}
                style={styles.deleteButton}
                title="Удалить категорию"
              >
                –
              </button>
            )}
          </li>
        ))}

        <li
          style={{
            marginTop: 10,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Новая категория"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={styles.newCategoryInput}
          />
          <button
            onClick={addCategory}
            style={styles.addButton}
            title="Добавить категорию"
          >
            +
          </button>
        </li>

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
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
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
  },
  categoryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  categoryItem: {
    padding: "8px 0",
    fontSize: 16,
  },
  newCategoryInput: {
    width: "150px",
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "30px",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    outline: "none",
  },
  addButton: {
    cursor: "pointer",
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    fontWeight: "bold",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  },
};

export default CategorySelector;

