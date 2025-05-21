import React, { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";


function TaskForm({ show, onHide, onSave, editTask, onDelete }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Закрытая");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || "");
      setDescription(editTask.description || "");
      setStatus(editTask.status || "Закрытая");
      setStartDate(editTask.startDate ? new Date(editTask.startDate) : null);
      setEndDate(editTask.endDate ? new Date(editTask.endDate) : null);
    } else {
      setTitle("");
      setDescription("");
      setStatus("Закрытая");
      setStartDate(null);
      setEndDate(null);
    }
  }, [editTask, show]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      status,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    });
    onHide();
  };


  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editTask ? "Редактировать задачу" : "Создать задачу"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formTitle">
            <Form.Label>Название задачи</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>


          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Описание задачи</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Введите описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>


          <Form.Group className="mb-3" controlId="formStatus">
            <Form.Label>Статус задачи</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Закрытая">Закрытая</option>
              <option value="Открытая">Открытая</option>
              <option value="Завершенная">Завершенная</option>
            </Form.Select>
          </Form.Group>


          <Form.Group className="mb-3" controlId="formStartDate">
            <Form.Label>Дата начала</Form.Label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="Pp"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              locale={ru}
              className="form-control"
              placeholderText="Выберите дату начала"
            />
          </Form.Group>


          <Form.Group className="mb-3" controlId="formEndDate">
            <Form.Label>Дата окончания</Form.Label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="Pp"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              locale={ru}
              minDate={startDate}
              disabled={!startDate}
              className="form-control"
              placeholderText="Выберите дату окончания"
            />
          </Form.Group>


          <Button variant="primary" type="submit" className="me-2">
            {editTask ? "Сохранить изменения" : "Создать задачу"}
          </Button>


          {editTask && editTask.status !== "Завершенная" && (
            <Button
              variant="outline-danger"
              onClick={() => {
                if (window.confirm("Удалить задачу?")) {
                  onDelete(editTask.id);
                  onHide();
                }
              }}
            >
              Удалить задачу
            </Button>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}


export default TaskForm;

