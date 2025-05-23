import React from "react";
import TaskItem from "./TaskItem";

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
}) => {
  // Если задач нет, выводим соответствующее сообщение
  if (tasks.length === 0) return <p>Задач нет</p>;

  return (
    <div>
      {tasks.map((task) => (
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
          openDescriptionModal={openDescriptionModal}
          styles={styles}
        />
      ))}
    </div>
  );
};

export default TaskList;