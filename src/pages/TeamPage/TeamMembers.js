// src/pages/TeamPage/TeamMembers.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
  Container,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Badge,
  Dropdown,
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import {
  FiUsers,
  FiUser,
  FiUserPlus,
  FiTrash2,
  FiChevronDown
} from 'react-icons/fi';

// Варианты цвета бейджа для ролей
const roleVariant = {
  owner: 'success',
  manager: 'info',
  member: 'secondary',
  observer: 'warning'
};

// Словарь названий ролей на русском
const roleNames = {
  owner: 'Владелец',
  manager: 'Менеджер',
  member: 'Участник',
  observer: 'Наблюдатель'
};

// Список ключей ролей
const roles = ['owner', 'manager', 'member', 'observer'];

const TeamMembers = ({ teamId }) => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Определение роли текущего пользователя в команде
  const myRole =
    team?.members.find(m => m.userId === currentUser.uid)?.role || 'member';

  // Подписка на изменения команды
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'teams', teamId), snap => {
      setTeam({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [teamId]);

  // Загрузка списка всех пользователей
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // Загрузка списка всех команд для отображения, в каких командах состоит пользователь
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'teams'));
      setAllTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // Добавление участника через модалку
  const handleAddMemberModal = async user => {
    if (!['owner', 'manager'].includes(myRole)) {
      return alert('У вас нет прав приглашать участников');
    }
    if (team.members.find(m => m.userId === user.id)) {
      return alert('Пользователь уже в команде');
    }
    const newMember = { userId: user.id, email: user.email, role: 'member' };
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayUnion(newMember) });
  };

  // Изменение роли участника (только владелец)
  const handleChangeRole = async (member, newRole) => {
    if (myRole !== 'owner') return alert('Только владелец может менять роли');
    if (member.userId === currentUser.uid) {
      return alert('Нельзя менять свою собственную роль');
    }
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayRemove(member) });
    await updateDoc(teamRef, {
      members: arrayUnion({ ...member, role: newRole })
    });
  };

  // Удаление участника из команды (только владелец)
  const handleRemoveMember = async member => {
    if (myRole !== 'owner') {
      return alert('Только владелец может удалять участников');
    }
    if (member.userId === currentUser.uid) {
      return alert('Нельзя удалить себя');
    }
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayRemove(member) });
  };

  if (loading || !team) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = allUsers.filter(u => {
    const name = u.fullName?.toLowerCase() || '';
    const lastName = u.fullName?.split(' ')[1]?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();
    return name.includes(q) || lastName.includes(q);
  });

  return (
    <Container className="py-4">
      <Card className="shadow-sm rounded-2 border-0 mb-4">
        <Card.Header className="bg-white border-0 d-flex align-items-center">
          <FiUsers className="me-2 text-primary" size={22} />
          <h5 className="mb-0">Участники команды «{team.name}»</h5>
        </Card.Header>
        <Card.Body>
          {['owner', 'manager'].includes(myRole) && (
            <Button variant="primary" className="mb-4" onClick={() => setShowModal(true)}>
              <FiUserPlus className="me-1" />Добавить участника
            </Button>
          )}

          <div className="d-flex flex-column gap-3">
            {team.members.map(member => {
              const user = allUsers.find(u => u.id === member.userId) || {};
              return (
                <Card key={member.userId} className="shadow-sm rounded-2 border-0">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FiUser className="me-3 text-secondary" size={24} />
                      <div>
                        <h6 className="mb-1">{user.fullName || user.email || '—'}</h6>
                        <p className="mb-0 text-muted small">{member.email}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg={roleVariant[member.role]} className="text-capitalize me-3">
                        {roleNames[member.role] || member.role}
                      </Badge>

                      <Dropdown onSelect={r => handleChangeRole(member, r)}>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <FiChevronDown />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {roles.map(r => (
                            <Dropdown.Item key={r} eventKey={r} active={r === member.role}>
                              {roleNames[r]}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-3 d-flex align-items-center"
                        onClick={() => handleRemoveMember(member)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Выбрать участника</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Поиск по имени или фамилии"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          <Row>
            {filteredUsers.map(user => (
              <Col key={user.id} xs={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm rounded-2">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="mb-1">{user.fullName || user.email}</h6>
                      <div>
                        {allTeams
                          .filter(t => t.members.some(m => m.userId === user.id))
                          .map(t => (
                            <Badge
                              bg="light"
                              text="dark"
                              key={t.id}
                              className="me-1 text-truncate"
                            >
                              {t.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      className="mt-2 align-self-end rounded-pill shadow-sm d-flex align-items-center justify-content-center px-3"
                      onClick={() => handleAddMemberModal(user)}
                    >
                      <FiUserPlus className="me-1" />Добавить
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamMembers;


