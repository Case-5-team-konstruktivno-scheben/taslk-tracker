import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  InputGroup,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Modal,
  Accordion,
  Dropdown
} from 'react-bootstrap';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import DatePicker from 'react-datepicker';
import {
  FiList,
  FiPlus,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiCheckSquare,
  FiRotateCcw,
  FiTrash,
  FiEdit,
  FiClock
} from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';

const statusOrder = { closed: 0, open: 1, completed: 2 };
const statusVariant = {
  closed: 'secondary',
  open: 'info',
  completed: 'success'
};

const TeamTasks = ({ teamId, currentUser, role }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  // Поля создания задачи
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState(false);

  // Уведомления
  const [notificationType, setNotificationType] = useState('none');
  const [notificationTime, setNotificationTime] = useState(null);
  const [notificationInterval, setNotificationInterval] = useState('daily');

  // Зависимости
  const [dependencies, setDependencies] = useState([]);

  // Поиск / Фильтр / Сортировка
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // Модалка редактирования
  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Реф для автозаполняемой textarea описания
  const descRef = useRef(null);
  const adjustTextarea = () => {
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  };

  // Обновление уровня пользователя
  const updateUserLevel = async (userId, points) => {
    const level = points >= 100 ? 'Expert' : points >= 50 ? 'Intermediate' : 'Novice';
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { level });
    alert(`Ваш новый уровень: ${level}`);
  };

  // Загрузка данных из Firestore
  useEffect(() => {
    const tasksQ = query(collection(db, 'tasks'), where('teamId', '==', teamId));
    const unsubTasks = onSnapshot(tasksQ, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      setTasks(arr);
      setLoading(false);
    });

    const depsQ = query(collection(db, 'tasks'), where('teamId', '==', teamId));
    const unsubDeps = onSnapshot(depsQ, snap => {
      setTasksList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const teamRef = doc(db, 'teams', teamId);
    const unsubTeam = onSnapshot(teamRef, async snap => {
      const data = snap.data() || {};
      setSettings(data.settings || {});
      const memberIds = (data.members || []).map(m => m.userId);
      if (memberIds.length) {
        const usersQ = query(collection(db, 'users'), where('__name__', 'in', memberIds));
        const usersSnap = await getDocs(usersQ);
        setMembers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    const catsQ = query(collection(db, 'categories'), where('teamId', '==', teamId));
    const unsubCats = onSnapshot(catsQ, snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubTasks();
      unsubDeps();
      unsubTeam();
      unsubCats();
    };
  }, [teamId]);

  // Добавление задачи
  const handleAddTask = async e => {
    e.preventDefault();
    if (!title.trim()) return alert('Введите название задачи');

    const selCat = categories.find(c => c.id === categoryId);
    const isAll = assignedTo === 'all' || !assignedTo;
    const selUser = members.find(u => u.id === assignedTo);
    const assignedToName = isAll
      ? 'Вся команда'
      : selUser?.fullName || selUser?.displayName || '';
    const assignedToEmail = isAll ? '' : selUser?.email || '';

    await addDoc(collection(db, 'tasks'), {
      teamId,
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId || null,
      categoryName: selCat?.name || null,
      assignedTo: isAll ? null : assignedTo,
      assignedToName,
      assignedToEmail,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      notificationType,
      notificationTime,
      notificationInterval,
      status: 'closed',
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || currentUser.email,
      createdByEmail: currentUser.email,
      createdAt: serverTimestamp(),
      dependencies,
    });

    setTitle('');
    setDescription('');
    setCategoryId('');
    setAssignedTo('');
    setDueDate(null);
    setPriority(false);
    setNotificationType('none');
    setNotificationTime(null);
    setNotificationInterval('daily');
    setDependencies([]);
  };

  // Изменение зависимостей
  const handleDependencyChange = (e, id) => {
    setDependencies(prev =>
      e.target.checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  // Открыть модалку редактирования
  const openEditModal = task => {
    setEditTask({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      dependencies: task.dependencies || []
    });
    setShowEdit(true);
  };

  // Сохранить изменения в задаче
  const handleSaveEdit = async () => {
    if (!editTask.title.trim()) return alert('Название не может быть пустым');
    const selCat = categories.find(c => c.id === editTask.categoryId);
    const isAll = editTask.assignedTo === 'all' || !editTask.assignedTo;
    const selUser = members.find(u => u.id === editTask.assignedTo);
    const assignedToName = isAll
      ? 'Вся команда'
      : selUser?.fullName || selUser?.displayName || '';
    const assignedToEmail = isAll ? '' : selUser?.email || '';

    await updateDoc(doc(db, 'tasks', editTask.id), {
      title: editTask.title.trim(),
      description: editTask.description.trim(),
      categoryId: editTask.categoryId || null,
      categoryName: selCat?.name || null,
      assignedTo: isAll ? null : editTask.assignedTo,
      assignedToName,
      assignedToEmail,
      dueDate: editTask.dueDate ? editTask.dueDate.toISOString() : null,
      priority: editTask.priority,
      notificationType: editTask.notificationType,
      notificationTime: editTask.notificationTime,
      notificationInterval: editTask.notificationInterval,
      dependencies: editTask.dependencies,
    });

    setShowEdit(false);
  };

  // Смена статуса задачи
  const handleToggleStatus = async task => {
    if (!task?.status) return;
    const next =
      task.status === 'closed'
        ? 'open'
        : task.status === 'open'
        ? 'completed'
        : 'closed';
    if (task.dependencies?.length) {
      const allDeps = await Promise.all(
        task.dependencies.map(async id => {
          const snap = await getDoc(doc(db, 'tasks', id));
          return snap.data()?.status === 'completed';
        })
      );
      if (!allDeps.every(Boolean)) {
        return alert('Не все зависимости выполнены.');
      }
    }
    await updateDoc(doc(db, 'tasks', task.id), { status: next });
    if (next === 'completed') {
      handleTaskCompletion(task.id, task.assignedTo);
    }
  };

  // Удаление задачи
  const handleDelete = async id => {
    if (window.confirm('Удалить задачу?')) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  // Начисление очков за выполнение
  const handleTaskCompletion = async (taskId, userId) => {
    const snap = await getDoc(doc(db, 'tasks', taskId));
    const data = snap.data() || {};
    const points = data.priority ? 20 : 10;
    const userSnap = await getDoc(doc(db, 'users', userId));
    const newPoints = (userSnap.data()?.points || 0) + points;
    await updateDoc(doc(db, 'users', userId), { points: newPoints });
    await updateUserLevel(userId, newPoints);
    alert(`Вы получили ${points} очков за задачу "${data.title}"!`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '30vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card className="shadow-sm rounded-2">
      <Card.Header className="bg-white border-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <FiList className="me-2 text-primary" size={20} />
          <h5 className="mb-0">Задачи команды</h5>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Панель создания задачи */}
        <Accordion defaultActiveKey="0" className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex align-items-center">
                <FiPlus className="me-2 text-success" />
                <span>Создать новую задачу</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={handleAddTask}>
                {/* Верхний ряд: Название, Категория, Исполнитель, Дедлайн, Важность */}
                <Row className="gx-2 gy-2 align-items-center">
                  <Col md={3}>
                    <InputGroup>
                      <InputGroup.Text><FiEdit /></InputGroup.Text>
                      <Form.Control
                        placeholder="Название"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <InputGroup>
                      <InputGroup.Text><FiFlag /></InputGroup.Text>
                      <Form.Select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                      >
                        <option value="">Категория</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={assignedTo}
                      onChange={e => setAssignedTo(e.target.value)}
                    >
                      <option value="all">Вся команда</option>
                      {members.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.displayName} ({u.email})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <InputGroup className="w-100">
                      <InputGroup.Text><FiCalendar /></InputGroup.Text>
                      <DatePicker
                        selected={dueDate}
                        onChange={setDueDate}
                        placeholderText="Дедлайн"
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Важное"
                      checked={priority}
                      onChange={e => setPriority(e.target.checked)}
                    />
                  </Col>
                </Row>

                {/* Описание */}
                <Form.Group className="mt-3">
                  <Form.Control
                    as="textarea"
                    placeholder="Описание"
                    value={description}
                    onChange={e => {
                      setDescription(e.target.value);
                      adjustTextarea();
                    }}
                    ref={descRef}
                    style={{ overflow: 'hidden' }}
                    rows={1}
                  />
                </Form.Group>

                {/* Кнопка «Добавить» и блок уведомлений/зависимостей */}
                <Row className="mt-3 gx-2 gy-2 align-items-start">
                  <Col md={3}>
                    <Button
                      type="submit"
                      variant="success"
                      className="w-100 d-flex align-items-center justify-content-center"
                    >
                      <FiPlus className="me-1" /> Добавить задачу
                    </Button>
                  </Col>
                  <Col md={9}>
                    <Accordion defaultActiveKey="1">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header className="py-1 px-2 small">
                          Уведомления и зависимости
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row className="gx-2 gy-2">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="small mb-1">Тип уведомления</Form.Label>
                                <Form.Select
                                  size="sm"
                                  className="form-select-sm"
                                  value={notificationType}
                                  onChange={e => setNotificationType(e.target.value)}
                                >
                                  <option value="none">Нет</option>
                                  <option value="interval">По интервалу</option>
                                  <option value="specificTime">Время</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            {notificationType === 'interval' && (
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Интервал</Form.Label>
                                  <Form.Select
                                    size="sm"
                                    className="form-select-sm"
                                    value={notificationInterval}
                                    onChange={e => setNotificationInterval(e.target.value)}
                                  >
                                    <option value="daily">Ежедневно</option>
                                    <option value="weekly">Еженедельно</option>
                                    <option value="monthly">Ежемесячно</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            )}
                            {notificationType === 'specificTime' && (
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Время</Form.Label>
                                  <InputGroup size="sm">
                                    <Form.Control
                                      type="datetime-local"
                                      value={notificationTime}
                                      onChange={e => setNotificationTime(e.target.value)}
                                      className="form-control-sm"
                                    />
                                    <InputGroup.Text className="py-1"><FiClock /></InputGroup.Text>
                                  </InputGroup>
                                </Form.Group>
                              </Col>
                            )}
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="small mb-1">Зависимости</Form.Label>
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="outline-secondary"
                                    id="dropdown-dependencies"
                                    className="w-100 small py-1"
                                    size="sm"
                                  >
                                    {dependencies.length
                                      ? `Зависимости (${dependencies.length})`
                                      : 'Выбрать зависимости'}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu
                                    style={{
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      width: '100%'
                                    }}
                                  >
                                    {tasksList.map(task => (
                                      <Dropdown.Item
                                        key={task.id}
                                        as="div"
                                        className="d-flex align-items-center py-1 small"
                                      >
                                        <Form.Check
                                          type="checkbox"
                                          checked={dependencies.includes(task.id)}
                                          onChange={e => handleDependencyChange(e, task.id)}
                                          label={task.title}
                                          className="mb-0 small"
                                        />
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Col>
                </Row>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Поиск и фильтрация */}
        <Row className="gx-2 gy-2 mb-4">
          <Col md={3}>
            <Form.Control
              placeholder="Поиск по задачам"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="closed">Закрытые</option>
              <option value="open">Открытые</option>
              <option value="completed">Завершенные</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="deadline">По дедлайну</option>
              <option value="createdAt">По дате создания</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Список задач */}
        <div className="d-flex flex-column gap-3">
          {tasks
            .filter(task => {
              const matchesStatus =
                filterStatus === 'all' || task.status === filterStatus;
              const text = `${task.title} ${task.description}`.toLowerCase();
              return matchesStatus && text.includes(searchTerm.toLowerCase());
            })
            .sort((a, b) =>
              sortBy === 'deadline'
                ? new Date(a.dueDate) - new Date(b.dueDate)
                : a.createdAt.toDate() - b.createdAt.toDate()
            )
            .map(task => {
              const dateStr = task.dueDate?.slice(0, 10) || '';
              const createdAtStr =
                task.createdAt?.toDate().toLocaleString() || '';
              const overdue = dateStr < today && task.status !== 'completed';
              const dueToday = dateStr === today;
              const authorInfo = members.find(u => u.id === task.createdBy) || {};
              const displayAuthor = `${authorInfo.fullName || task.createdByName} (${
                authorInfo.email || task.createdByEmail
              })`;
              const isAll = task.assignedTo === null || task.assignedTo === 'all';
              const assigneeInfo = !isAll
                ? members.find(u => u.id === task.assignedTo) || {}
                : null;
              const displayAssignee = isAll
                ? 'Вся команда'
                : `${assigneeInfo.fullName || task.assignedToName} (${
                    assigneeInfo.email || task.assignedToEmail
                  })`;

              return (
                <Card
                  key={task.id}
                  className="shadow-sm rounded-2 border-0"
                  style={{
                    backgroundColor: overdue
                      ? 'rgba(220, 53, 69, 0.1)'
                      : dueToday
                      ? 'rgba(255, 193, 7, 0.1)'
                      : 'transparent',
                    color: overdue ? '#dc3545' : dueToday ? '#856404' : undefined
                  }}
                >
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{task.title}</h6>
                      <p className="mb-1 text-muted small">
                        {task.description || '—'}
                      </p>
                      <p className="mb-1 text-muted small">
                        Создано: {createdAtStr} | Автор: {displayAuthor}
                      </p>
                      <p className="mb-1 text-muted small">
                        Исполнитель: {displayAssignee}
                      </p>
                      <div className="d-flex align-items-center flex-wrap">
                        {task.categoryName && (
                          <Badge bg="light" text="dark" className="me-2">
                            {task.categoryName}
                          </Badge>
                        )}
                        <Badge bg="light" text="dark" className="me-2">
                          <FiCalendar className="me-1" /> {dateStr || '—'}
                        </Badge>
                        {task.priority && (
                          <Badge bg="danger" className="me-2">
                            <FiFlag className="me-1" /> Важное
                          </Badge>
                        )}
                        <Badge
                          bg={statusVariant[task.status]}
                          className="text-capitalize"
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(task)}
                        disabled={!['owner', 'manager'].includes(role)}
                        className="me-2 d-flex align-items-center"
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleToggleStatus(task)}
                        disabled={!['owner', 'manager'].includes(role)}
                        className="me-2 d-flex align-items-center"
                      >
                        {task.status === 'closed' && <FiPlay />}
                        {task.status === 'open' && <FiCheckSquare />}
                        {task.status === 'completed' && <FiRotateCcw />}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        disabled={
                          !(
                            role === 'owner' ||
                            (role === 'manager' && settings.managerCanDeleteTasks)
                          )
                        }
                        className="d-flex align-items-center"
                      >
                        <FiTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
        </div>
      </Card.Body>

      {/* Модалка редактирования */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать задачу</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTask && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Название</Form.Label>
                <Form.Control
                  value={editTask.title}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, title: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTask.description}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, description: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  value={editTask.categoryId || ''}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, categoryId: e.target.value }))
                  }
                >
                  <option value="">Без категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Исполнитель</Form.Label>
                <Form.Select
                  value={editTask.assignedTo || ''}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, assignedTo: e.target.value }))
                  }
                >
                  <option value="all">Вся команда</option>
                  {members.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.displayName} ({u.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Зависимости</Form.Label>
                <Form.Control
                  placeholder="ID зависимостей через запятую"
                  value={editTask.dependencies.join(',')}
                  onChange={e =>
                    setEditTask(prev => ({
                      ...prev,
                      dependencies: e.target.value.split(',')
                    }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Дедлайн</Form.Label>
                <DatePicker
                  selected={editTask.dueDate}
                  onChange={date =>
                    setEditTask(prev => ({ ...prev, dueDate: date }))
                  }
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Важное"
                  checked={editTask.priority}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, priority: e.target.checked }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Тип уведомления</Form.Label>
                <Form.Select
                  value={editTask.notificationType}
                  onChange={e =>
                    setEditTask(prev => ({
                      ...prev,
                      notificationType: e.target.value
                    }))
                  }
                >
                  <option value="none">Нет</option>
                  <option value="interval">По интервалу</option>
                  <option value="specificTime">Время</option>
                </Form.Select>
              </Form.Group>
              {editTask.notificationType === 'interval' && (
                <Form.Group className="mb-3">
                  <Form.Label>Интервал</Form.Label>
                  <Form.Select
                    value={editTask.notificationInterval}
                    onChange={e =>
                      setEditTask(prev => ({
                        ...prev,
                        notificationInterval: e.target.value
                      }))
                    }
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </Form.Select>
                </Form.Group>
              )}
              {editTask.notificationType === 'specificTime' && (
                <Form.Group className="mb-3">
                  <Form.Label>Время уведомления</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="datetime-local"
                      value={editTask.notificationTime}
                      onChange={e =>
                        setEditTask(prev => ({
                          ...prev,
                          notificationTime: e.target.value
                        }))
                      }
                    />
                    <InputGroup.Text><FiClock /></InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default TeamTasks;




