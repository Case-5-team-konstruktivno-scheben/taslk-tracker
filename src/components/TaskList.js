import React from "react";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";


function TaskList({ tasks, onEdit, onStart, onComplete, onClose, onDelete }) {
  return (
    <div className="d-flex flex-column gap-3">
      {tasks.map((task) => (
        <Card key={task.id}>
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <Card.Title>{task.title}</Card.Title>
                <Card.Text>{task.description}</Card.Text>
                <Badge bg="secondary">{task.status}</Badge>
                {task.startDate && (
                  <div className="mt-2">
                    <strong>Время начала:</strong> {new Date(task.startDate).toLocaleString()}
                  </div>
                )}
                {task.endDate && (
                  <div className="mt-2">
                    <strong>Время окончания:</strong> {new Date(task.endDate).toLocaleString()}
                  </div>
                )}
              </Col>
              <Col xs="auto">
                {task.status === "Закрытая" && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => onStart(task)}
                    >
                      Открыть
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => onComplete(task)}
                    >
                      Завершить
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      Редактировать
                    </Button>
                  </>
                )}


                {task.status === "Открытая" && (
                  <>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => onClose(task)}
                    >
                      Закрыть
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => onComplete(task)}
                    >
                      Завершить
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      Редактировать
                    </Button>
                  </>
                )}


                {task.status === "Завершенная" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                  >
                    Удалить
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}


export default TaskList;


