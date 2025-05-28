// src/pages/TeamPage/TeamSettings.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Modal,
  InputGroup // Добавьте этот импорт
} from 'react-bootstrap'; // InputGroup добавлен здесь
import { FiSettings, FiSave, FiInfo, FiPlus, FiEdit, FiTrash } from 'react-icons/fi';

const TeamSettings = ({ teamId, role }) => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [autoNotifications, setAutoNotifications] = useState(false);
  const [managerInvite, setManagerInvite] = useState(false);
  const [managerDelete, setManagerDelete] = useState(false);
  const [notificationTemplate, setNotificationTemplate] = useState('');

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const teamRef = doc(db, 'teams', teamId);
    const unsub = onSnapshot(teamRef, snapshot => {
      const data = snapshot.data() || {};
      setName(data.name || '');
      setDescription(data.description || '');
      const settings = data.settings || {};
      setAutoNotifications(settings.autoNotificationsEnabled || false);
      setManagerInvite(settings.managerCanInvite || false);
      setManagerDelete(settings.managerCanDeleteTasks || false);
      setNotificationTemplate(settings.notificationTemplate || '');
      setLoading(false);
    });

    const categoriesRef = collection(db, 'categories');
    const unsubCategories = onSnapshot(categoriesRef, snapshot => {
      const categoryList = snapshot.docs.filter(doc => doc.data().teamId === teamId).map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoryList);
    });

    return () => {
      unsub();
      unsubCategories();
    };
  }, [teamId]);

  const handleSave = async e => {
    e.preventDefault();
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      name,
      description,
      settings: {
        autoNotificationsEnabled: autoNotifications,
        managerCanInvite: managerInvite,
        managerCanDeleteTasks: managerDelete,
        notificationTemplate
      }
    });
    alert('Настройки сохранены');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const categoryRef = collection(db, 'categories');
    await addDoc(categoryRef, {
      teamId,
      name: newCategoryName.trim()
    });
    setNewCategoryName('');
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory?.name.trim()) return;
    const categoryRef = doc(db, 'categories', editingCategory.id);
    await updateDoc(categoryRef, {
      name: editingCategory.name.trim()
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      const categoryRef = doc(db, 'categories', categoryId);
      await deleteDoc(categoryRef);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!['owner', 'manager'].includes(role)) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <FiInfo className="me-2" />
          У вас нет прав для управления настройками.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm rounded-2 border-0">
        <Card.Header className="bg-white border-0 d-flex align-items-center">
          <FiSettings className="me-2 text-primary" size={22} />
          <h5 className="mb-0">Настройки команды</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3" controlId="teamName">
              <Form.Label>Название команды</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Введите название"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="teamDescription">
              <Form.Label>Описание команды</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Кратко о команде"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="autoNotifications">
              <Form.Check
                type="switch"
                label="Авто-уведомления"
                checked={autoNotifications}
                onChange={e => setAutoNotifications(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="managerInvite">
              <Form.Check
                type="switch"
                label="Менеджеры могут приглашать участников"
                checked={managerInvite}
                onChange={e => setManagerInvite(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="managerDelete">
              <Form.Check
                type="switch"
                label="Менеджеры могут удалять задачи"
                checked={managerDelete}
                onChange={e => setManagerDelete(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="notificationTemplate">
              <Form.Label>Шаблон уведомления</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={notificationTemplate}
                onChange={e => setNotificationTemplate(e.target.value)}
                placeholder="Пример: 'Задача {{title}} назначена...'"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit" className="d-flex align-items-center">
                <FiSave className="me-2" /> Сохранить
              </Button>
            </div>
          </Form>

          {/* Категории */}
          <Card className="mt-4">
            <Card.Header>
              <h6>Категории задач</h6>
            </Card.Header>
            <Card.Body>
              <InputGroup className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Название категории"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={handleAddCategory}>
                  <FiPlus /> Добавить
                </Button>
              </InputGroup>

              <ListGroup>
                {categories.map((category) => (
                  <ListGroup.Item key={category.id} className="d-flex justify-content-between align-items-center">
                    <span>{category.name}</span>
                    <div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="ms-2"
                      >
                        <FiTrash />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Модалка для редактирования категории */}
      <Modal show={editingCategory !== null} onHide={() => setEditingCategory(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCategory && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Название категории</Form.Label>
                <Form.Control
                  value={editingCategory.name}
                  onChange={e => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  onClick={handleSaveCategory}
                >
                  Сохранить
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TeamSettings;
