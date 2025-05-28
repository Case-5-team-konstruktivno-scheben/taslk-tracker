// src/pages/TeamPage/TeamTasks.js

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
import teamPermissions from '../../config/teamPermissions';
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
  FiClock,
  FiUser,
  FiAward,
  FiInfo
} from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';

const statusOrder = { closed: 0, open: 1, completed: 2 };

const TeamTasks = ({ teamId, currentUser, role }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManage = teamPermissions[teamId]?.[role]?.canManageTasks ?? true;
  const canDelete = teamPermissions[teamId]?.[role]?.canDelete ?? true;

  // new-task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState(false);
  const [notificationType, setNotificationType] = useState('none');
  const [notificationTime, setNotificationTime] = useState(null);
  const [notificationInterval, setNotificationInterval] = useState('daily');
  const [dependencies, setDependencies] = useState([]);

  // filters & sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // desc modal
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedTaskDesc, setSelectedTaskDesc] = useState(null);

  const descRef = useRef(null);
  const adjustTextarea = () => {
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const tasksQ = query(collection(db, 'tasks'), where('teamId', '==', teamId));

    const unsubTasks = onSnapshot(tasksQ, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      setTasks(arr);
      setLoading(false);
    });

    const unsubTasksList = onSnapshot(tasksQ, snap => {
      setTasksList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const teamRef = doc(db, 'teams', teamId);
    const unsubTeam = onSnapshot(teamRef, async snap => {
      const data = snap.data() || {};
      const memberIds = (data.members || []).map(m => m.userId);
      if (memberIds.length) {
        const usersQ = query(
          collection(db, 'users'),
          where('__name__', 'in', memberIds)
        );
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
      unsubTasksList();
      unsubTeam();
      unsubCats();
    };
  }, [teamId]);

  const handleAddTask = async e => {
    e.preventDefault();
    if (!title.trim()) return alert('Введите название задачи');

    const selCat = categories.find(c => c.id === categoryId);
    const selUser = members.find(u => u.id === assignedTo);
    const assignedToName = assignedTo ? selUser.fullName : 'Вся команда';
    const assignedToEmail = assignedTo ? selUser.email : '';

    await addDoc(collection(db, 'tasks'), {
      teamId,
      title: title.trim(),
      description: description.trim(),
      categoryId: selCat?.id || null,
      categoryName: selCat?.name || null,
      assignedTo: assignedTo || null,
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
      dependencies
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

  const handleDependencyChange = (e, id) =>
    setDependencies(prev =>
      e.target.checked ? [...prev, id] : prev.filter(x => x !== id)
    );

  const openEditModal = task => {
    setEditTask({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      dependencies: task.dependencies || []
    });
    setShowEdit(true);
  };

  const openDescriptionModal = task => {
    setSelectedTaskDesc(task);
    setShowDescModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTask.title.trim()) return alert('Название не может быть пустым');

    const selCat = categories.find(c => c.id === editTask.categoryId);
    const selUser = members.find(u => u.id === editTask.assignedTo);
    const assignedToName = editTask.assignedTo ? selUser.fullName : 'Вся команда';
    const assignedToEmail = editTask.assignedTo ? selUser.email : '';

    await updateDoc(doc(db, 'tasks', editTask.id), {
      title: editTask.title.trim(),
      description: editTask.description.trim(),
      categoryId: selCat?.id || null,
      categoryName: selCat?.name || null,
      assignedTo: editTask.assignedTo || null,
      assignedToName,
      assignedToEmail,
      dueDate: editTask.dueDate ? editTask.dueDate.toISOString() : null,
      priority: editTask.priority,
      notificationType: editTask.notificationType,
      notificationTime: editTask.notificationTime,
      notificationInterval: editTask.notificationInterval,
      dependencies: editTask.dependencies
    });

    setShowEdit(false);
  };

  const handleToggleStatus = async task => {
    const nextStatus =
      task.status === 'closed'
        ? 'open'
        : task.status === 'open'
        ? 'completed'
        : 'closed';

    if (task.dependencies?.length) {
      const ok = await Promise.all(
        task.dependencies.map(async id => {
          const snap = await getDoc(doc(db, 'tasks', id));
          return snap.data()?.status === 'completed';
        })
      );
      if (!ok.every(Boolean)) return alert('Не все зависимости выполнены');
    }

    await updateDoc(doc(db, 'tasks', task.id), { status: nextStatus });
  };

  const handleDelete = async id => {
    if (window.confirm('Удалить задачу?')) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={styles.container}>
      <div style={styles.decorCircleTop} />
      <div style={styles.decorCircleBottom} />

      <Card style={styles.glassCard}>
        <Card.Header style={styles.cardHeader}>
          <FiList style={styles.iconPrimary} size={20} />
          <h5 style={styles.heading}>Задачи команды</h5>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          {/* New Task Accordion */}
          <Accordion defaultActiveKey="0" style={styles.accordion}>
            <Accordion.Item eventKey="0" style={styles.accordionItem}>
              <Accordion.Header style={styles.accordionHeader}>
                <FiPlus style={styles.iconSuccess} />
                <span style={styles.accordionTitle}>Создать новую задачу</span>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
                <Form onSubmit={handleAddTask}>
                  <Row className="gx-3 gy-3" style={styles.row}>
                    <Col md={3}>
                      <InputGroup>
                        <InputGroup.Text style={styles.inputIcon}>
                          <FiEdit />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Название"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          style={styles.input}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={2}>
                      <InputGroup>
                        <InputGroup.Text style={styles.inputIcon}>
                          <FiFlag />
                        </InputGroup.Text>
                        <Form.Select
                          value={categoryId}
                          onChange={e => setCategoryId(e.target.value)}
                          style={styles.input}
                        >
                          <option value="">Категория</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <InputGroup>
                        <InputGroup.Text style={styles.inputIcon}>
                          <FiUser />
                        </InputGroup.Text>
                        <Form.Select
                          value={assignedTo}
                          onChange={e => setAssignedTo(e.target.value)}
                          style={styles.input}
                        >
                          <option value="">Вся команда</option>
                          {members.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.fullName || u.email}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col md={2}>
                      <DatePicker
                        selected={dueDate}
                        onChange={setDueDate}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Дедлайн"
                        customInput={
                          <Form.Control
                            readOnly
                            placeholder="Дедлайн"
                            value={dueDate ? dueDate.toISOString().slice(0, 10) : ''}
                            style={styles.dateInput}
                          />
                        }
                      />
                    </Col>
                    <Col md={2} style={styles.colCenter}>
                      <Form.Check
                        type="checkbox"
                        label="Важное"
                        checked={priority}
                        onChange={e => setPriority(e.target.checked)}
                      />
                    </Col>
                  </Row>
                  <Form.Group style={styles.formGroup}>
                    <Form.Control
                      as="textarea"
                      placeholder="Описание"
                      value={description}
                      onChange={e => {
                        setDescription(e.target.value);
                        adjustTextarea();
                      }}
                      ref={descRef}
                      rows={1}
                      style={styles.textarea}
                    />
                  </Form.Group>
                  <div style={styles.addRow}>
                    <Button type="submit" style={styles.successButton}>
                      <FiPlus /> Добавить
                    </Button>
                    <Accordion defaultActiveKey="1" style={styles.innerAccordion}>
                      <Accordion.Item eventKey="1" style={styles.accordionItem}>
                        <Accordion.Header style={styles.accordionHeaderSmall}>
                          <FiClock /> Уведомления и зависимости
                        </Accordion.Header>
                        <Accordion.Body style={styles.accordionBodySmall}>
                          <Row className="gx-3 gy-3">
                            <Col md={12}>
                              <Form.Select
                                value={notificationType}
                                onChange={e => setNotificationType(e.target.value)}
                                style={styles.input}
                              >
                                <option value="none">Нет</option>
                                <option value="interval">По интервалу</option>
                                <option value="specificTime">Время</option>
                              </Form.Select>
                            </Col>
                            {notificationType === 'interval' && (
                              <Col md={12}>
                                <Form.Select
                                  value={notificationInterval}
                                  onChange={e => setNotificationInterval(e.target.value)}
                                  style={styles.input}
                                >
                                  <option value="daily">Ежедневно</option>
                                  <option value="weekly">Еженедельно</option>
                                  <option value="monthly">Ежемесячно</option>
                                </Form.Select>
                              </Col>
                            )}
                            {notificationType === 'specificTime' && (
                              <Col md={12}>
                                <InputGroup>
                                  <Form.Control
                                    type="datetime-local"
                                    value={notificationTime}
                                    onChange={e => setNotificationTime(e.target.value)}
                                    style={styles.input}
                                  />
                                  <InputGroup.Text style={styles.inputIcon}>
                                    <FiClock />
                                  </InputGroup.Text>
                                </InputGroup>
                              </Col>
                            )}
                            <Col md={12}>
                              <Dropdown>
                                <Dropdown.Toggle style={styles.outlineButtonSmall}>
                                  {dependencies.length
                                    ? `Зависимости (${dependencies.length})`
                                    : 'Выбрать зависимости'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={styles.dropdownMenu}>
                                  {tasksList.map(t => (
                                    <Dropdown.Item
                                      key={t.id}
                                      as="div"
                                      style={styles.dropdownItem}
                                    >
                                      <Form.Check
                                        type="checkbox"
                                        checked={dependencies.includes(t.id)}
                                        onChange={e =>
                                          handleDependencyChange(e, t.id)
                                        }
                                        label={t.title}
                                        style={styles.checkbox}
                                      />
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Filters */}
          <Row className="gx-3 gy-3" style={styles.row}>
            <Col md={2}>
              <Form.Control
                placeholder="Поиск по задачам"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={styles.input}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={styles.input}
              >
                <option value="all">Все</option>
                <option value="closed">Закрытые</option>
                <option value="open">Открытые</option>
                <option value="completed">Завершенные</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                style={styles.input}
              >
                <option value="all">Все пользователи</option>
                <option value="team">Вся команда</option>
                {members.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={styles.input}
              >
                <option value="deadline">По дедлайну</option>
                <option value="createdAt">По дате создания</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Task List */}
          <div style={styles.taskList}>
            {tasks
              .filter(task => {
                const okStatus = filterStatus === 'all' || task.status === filterStatus;
                const txt = `${task.title} ${task.description}`.toLowerCase();
                const okSearch = txt.includes(searchTerm.toLowerCase());

                let okUser = true;
                if (filterUser === 'team') {
                  okUser = !task.assignedTo;
                } else if (filterUser !== 'all') {
                  okUser = task.assignedTo === filterUser;
                }

                return okStatus && okSearch && okUser;
              })
              .sort((a, b) =>
                sortBy === 'deadline'
                  ? new Date(a.dueDate || '') - new Date(b.dueDate || '')
                  : a.createdAt.toDate() - b.createdAt.toDate()
              )
              .map(task => {
                const dateStr = task.dueDate?.slice(0, 10) || '';
                const overdue = dateStr < today && task.status !== 'completed';
                const dueToday = dateStr === today;
                const author =
                  members.find(u => u.id === task.createdBy) || {};

                return (
                  <Card
                    key={task.id}
                    style={{
                      ...styles.taskCard,
                      backgroundColor: overdue
                        ? 'rgba(220,53,69,0.05)'
                        : dueToday
                        ? 'rgba(255,193,7,0.05)'
                        : 'transparent',
                      borderLeft: overdue
                        ? '4px solid #dc3545'
                        : dueToday
                        ? '4px solid #ffc107'
                        : '4px solid #f8f9fa'
                    }}
                  >
                    <Card.Body style={styles.taskCardBody}>
                      <div style={styles.taskHeader}>
                        <h6 style={styles.taskTitle}>{task.title}</h6>
                      </div>
                      <div style={styles.metaRow}>
                        <Badge style={styles.statusBadge(task.status)}>
                          {task.status === 'closed' && <FiPlay />}
                          {task.status === 'open' && <FiCheckSquare />}
                          {task.status === 'completed' && <FiRotateCcw />}
                          {' '}{task.status}
                        </Badge>
                        {task.categoryName && (
                          <Badge style={styles.categoryBadge}>
                            <FiFlag /> {task.categoryName}
                          </Badge>
                        )}
                        {task.priority && (
                          <Badge style={styles.dangerBadge}>
                            <FiFlag /> Важное
                          </Badge>
                        )}
                        <Badge
                          style={
                            overdue
                              ? styles.dangerBadge
                              : dueToday
                              ? styles.warningBadge
                              : styles.lightBadge
                          }
                        >
                          <FiCalendar /> {dateStr || '—'}
                        </Badge>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoItem}>
                          <FiUser /> {task.assignedToName}
                        </span>
                        <span style={styles.infoItem}>
                          <FiAward /> {author.fullName || task.createdByName}
                        </span>
                      </div>
                    </Card.Body>
                    <Card.Footer style={styles.cardFooter}>
                      <Button
                        style={styles.infoButton}
                        onClick={() => openDescriptionModal(task)}
                      >
                        <FiInfo /> Описание
                      </Button>
                      <Button
                        style={styles.outlineButton}
                        onClick={() => openEditModal(task)}
                        disabled={!canManage}
                      >
                        <FiEdit /> Изменить
                      </Button>
                      <Button
                        style={styles.outlineButton}
                        onClick={() => handleToggleStatus(task)}
                        disabled={!canManage}
                      >
                        {task.status === 'closed' && <><FiPlay /> Открыть</>}
                        {task.status === 'open' && <><FiCheckSquare /> Завершить</>}
                        {task.status === 'completed' && <><FiRotateCcw /> Переоткрыть</>}
                      </Button>
                      <Button
                        style={styles.dangerButton}
                        onClick={() => handleDelete(task.id)}
                        disabled={!canDelete}
                      >
                        <FiTrash /> Удалить
                      </Button>
                    </Card.Footer>
                  </Card>
                );
              })}
          </div>
        </Card.Body>
      </Card>

      {/* Description Modal */}
      <Modal show={showDescModal} onHide={() => setShowDescModal(false)} centered>
        <Modal.Header style={styles.modalHeader} closeButton>
          <Modal.Title style={styles.modalTitle}>
            {selectedTaskDesc?.title || 'Описание задачи'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskDesc?.description ? (
            <p>{selectedTaskDesc.description}</p>
          ) : (
            <p style={styles.noDescription}>Описание отсутствует</p>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button style={styles.outlineButton} onClick={() => setShowDescModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header style={styles.modalHeader} closeButton>
          <Modal.Title style={styles.modalTitle}>Редактировать задачу</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTask && (
            <Form>
              {/* ... все поля редактирования без изменений ... */}
              <Form.Group style={styles.formGroup}>
                <Form.Label>Название</Form.Label>
                <Form.Control
                  value={editTask.title}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, title: e.target.value }))
                  }
                  style={styles.formControl}
                />
              </Form.Group>
              <Form.Group style={styles.formGroup}>
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTask.description}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, description: e.target.value }))
                  }
                  style={styles.formControl}
                />
              </Form.Group>
              <Row className="gx-3 gy-3">
                <Col md={6}>
                  <Form.Group style={styles.formGroup}>
                    <Form.Label>Категория</Form.Label>
                    <Form.Select
                      value={editTask.categoryId || ''}
                      onChange={e =>
                        setEditTask(prev => ({ ...prev, categoryId: e.target.value }))
                      }
                      style={styles.formControl}
                    >
                      <option value="">Без категории</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group style={styles.formGroup}>
                    <Form.Label>Исполнитель</Form.Label>
                    <Form.Select
                      value={editTask.assignedTo || ''}
                      onChange={e =>
                        setEditTask(prev => ({ ...prev, assignedTo: e.target.value }))
                      }
                      style={styles.formControl}
                    >
                      <option value="">Вся команда</option>
                      {members.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="gx-3 gy-3">
                <Col md={6}>
                  <Form.Group style={styles.formGroup}>
                    <Form.Label>Дедлайн</Form.Label>
                    <DatePicker
                      selected={editTask.dueDate}
                      onChange={date =>
                        setEditTask(prev => ({ ...prev, dueDate: date }))
                      }
                      className="form-control"
                      style={styles.formControl}
                      dateFormat="yyyy-MM-dd"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} style={styles.colCenter}>
                  <Form.Check
                    type="checkbox"
                    label="Важное"
                    checked={editTask.priority}
                    onChange={e =>
                      setEditTask(prev => ({ ...prev, priority: e.target.checked }))
                    }
                  />
                </Col>
              </Row>
              <Form.Group style={styles.formGroup}>
                <Form.Label>Зависимости</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle style={styles.outlineButtonSmall}>
                    {editTask.dependencies.length
                      ? `Зависимости (${editTask.dependencies.length})`
                      : 'Выбрать зависимости'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={styles.dropdownMenu}>
                    {tasksList.map(t => (
                      <Dropdown.Item key={t.id} as="div" style={styles.dropdownItem}>
                        <Form.Check
                          type="checkbox"
                          checked={editTask.dependencies.includes(t.id)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setEditTask(prev => ({
                              ...prev,
                              dependencies: checked
                                ? [...prev.dependencies, t.id]
                                : prev.dependencies.filter(x => x !== t.id)
                            }));
                          }}
                          label={t.title}
                          style={styles.checkbox}
                        />
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group style={styles.formGroup}>
                <Form.Label>Тип уведомления</Form.Label>
                <Form.Select
                  value={editTask.notificationType}
                  onChange={e =>
                    setEditTask(prev => ({ ...prev, notificationType: e.target.value }))
                  }
                  style={styles.formControl}
                >
                  <option value="none">Нет</option>
                  <option value="interval">По интервалу</option>
                  <option value="specificTime">Время</option>
                </Form.Select>
              </Form.Group>
              {editTask.notificationType === 'interval' && (
                <Form.Group style={styles.formGroup}>
                  <Form.Label>Интервал</Form.Label>
                  <Form.Select
                    value={editTask.notificationInterval}
                    onChange={e =>
                      setEditTask(prev => ({
                        ...prev,
                        notificationInterval: e.target.value
                      }))
                    }
                    style={styles.formControl}
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </Form.Select>
                </Form.Group>
              )}
              {editTask.notificationType === 'specificTime' && (
                <Form.Group style={styles.formGroup}>
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
                      style={styles.formControl}
                    />
                    <InputGroup.Text style={styles.inputIcon}>
                      <FiClock />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button style={styles.outlineButton} onClick={() => setShowEdit(false)}>
            Отмена
          </Button>
          <Button style={styles.primaryButton} onClick={handleSaveEdit}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    minHeight: '100vh'
  },
  decorCircleTop: {
    position: 'absolute',
    top: '-200px',
    right: '-200px',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: '-300px',
    left: '-200px',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '30vh'
  },
  glassCard: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 12px 32px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    borderBottom: 'none'
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 800,
    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  iconPrimary: {
    color: 'rgba(79,70,229,0.8)'
  },
  cardBody: {
    padding: '1.5rem'
  },
  accordion: {
    marginBottom: '1.5rem'
  },
  accordionItem: {
    border: 'none'
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(241,245,249,0.8)',
    borderRadius: '12px'
  },
  accordionHeaderSmall: { /* ... */ },
  accordionBody: { /* ... */ },
  accordionBodySmall: { /* ... */ },
  iconSuccess: {
    color: 'rgba(16,185,129,0.8)'
  },
  row: {
    marginBottom: '1rem'
  },
  inputIcon: {
    backgroundColor: '#fff',
    border: 'none'
  },
  input: {
    borderRadius: '12px',
    border: '2px solid #e2e8f0'
  },
  dateInput: {
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    minWidth: '6rem'
  },
  colCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  textarea: {
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    overflow: 'hidden'
  },
  addRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginTop: '1rem'
  },
  successButton: {
    background: 'linear-gradient(45deg, #10b981 0%, #34d399 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  innerAccordion: { /* ... */ },
  outlineButtonSmall: { /* ... */ },
  dropdownMenu: { /* ... */ },
  dropdownItem: { /* ... */ },
  checkbox: { margin: 0 },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  taskCard: {
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 8px 24px rgba(15,23,42,0.1)'
  },
  taskCardBody: {
    padding: '1.25rem'
  },
  taskHeader: {
    marginBottom: '0.5rem'
  },
  taskTitle: {
    margin: 0,
    fontWeight: 700,
    fontSize: '1.1rem'
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    alignItems: 'center'
  },
  categoryBadge: { /* ... */ },
  infoRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    borderTop: 'none',
    padding: '0.75rem 1.25rem'
  },
  infoButton: { /* ... */ },
  outlineButton: { /* ... */ },
  dangerButton: { /* ... */ },
  lightBadge: { /* ... */ },
  dangerBadge: { /* ... */ },
  warningBadge: { /* ... */ },
  statusBadge: status => ({ /* ... */ }),
  modalHeader: { borderBottom: 'none' },
  modalTitle: { fontWeight: 600 },
  modalFooter: {
    borderTop: 'none',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '1rem'
  },
  formControl: { /* ... */ },
  primaryButton: { /* ... */ },
  noDescription: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem'
  }
};

export default TeamTasks;