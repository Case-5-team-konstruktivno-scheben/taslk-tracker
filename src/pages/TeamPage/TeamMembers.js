import React, { useState, useEffect, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import {
  Container,
  Card,
  Form,
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

const MenuPortal = forwardRef(({ children, style, className, ...props }, ref) =>
  ReactDOM.createPortal(
    <div ref={ref} style={style} className={className} {...props}>
      {children}
    </div>,
    document.body
  )
);

const TeamMembers = ({ teamId }) => {
  const { currentUser, teamPermissions } = useAuth();
  const [team, setTeam] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openRoleMenu, setOpenRoleMenu] = useState(null);

  useEffect(() => {
    const teamRef = doc(db, 'teams', teamId);
    const unsub = onSnapshot(teamRef, snap => {
      const data = { id: snap.id, ...snap.data() };
      setTeam(data);

      const settings = data.settings || {};
      const rolesMap = settings.roles || {};
      const rolesList = Object.entries(rolesMap).map(([key, { label, rights, inherits }]) => ({
        name: key,
        label,
        rights,
        inherits
      }));
      setRoles(rolesList);

      setLoading(false);
    });
    return () => unsub();
  }, [teamId]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  if (loading || !team) {
    return (
      <Container style={styles.container}>
        <Spinner animation="border" style={styles.spinner} />
      </Container>
    );
  }

  const currentMember = team.members.find(m => m.userId === currentUser.uid);
  const currentUserRole = currentMember ? currentMember.role : null;
  const canInvite = teamPermissions?.[teamId]?.[currentUserRole]?.canInvite;
  const canDelete = currentUserRole === 'owner' || teamPermissions?.[teamId]?.[currentUserRole]?.canDelete;
  const canManageRoles =
    currentUserRole === 'owner' ||
    teamPermissions?.[teamId]?.[currentUserRole]?.canManageRoles;

  const filteredUsers = allUsers.filter(u => {
    const name = (u.fullName || u.email || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const handleAddMember = async user => {
    if (!canInvite) return alert('У вас нет прав приглашать участников');
    if (team.members.some(m => m.userId === user.id))
      return alert('Пользователь уже в команде');
    const defaultRole = roles[0]?.name || 'member';
    const newMember = { userId: user.id, email: user.email, role: defaultRole };
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayUnion(newMember) });
  };

  const handleChangeRole = async (member, newRole) => {
    if (!canManageRoles) return alert('У вас нет прав изменять роли участников');
    if (member.userId === currentUser.uid) return alert('Нельзя менять свою роль');
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayRemove(member) });
    await updateDoc(teamRef, { members: arrayUnion({ ...member, role: newRole }) });
  };

  const handleRemoveMember = async member => {
    if (!canDelete) return alert('У вас нет прав удалять участников');
    if (member.userId === currentUser.uid) return alert('Нельзя удалить себя');
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { members: arrayRemove(member) });
  };

  return (
    <>
      <style type="text/css">{`
        .dropdown-toggle.no-caret::after {
          display: none !important;
        }
      `}</style>

      <Container style={styles.container}>
        <div style={styles.decorCircleTop} />
        <div style={styles.decorCircleBottom} />

        <Card style={styles.card}>
          <Card.Header style={styles.cardHeader}>
            <FiUsers size={22} style={styles.iconPrimary} />
            <h5 style={styles.heading}>Участники команды «{team.name}»</h5>
          </Card.Header>
          <Card.Body style={styles.cardBody}>
            {canInvite && (
              <Button style={styles.primaryButton} onClick={() => setShowModal(true)}>
                <FiUserPlus style={styles.iconButton} /> Добавить участника
              </Button>
            )}

            <div style={styles.memberList}>
              {team.members.map(member => {
                const user = allUsers.find(u => u.id === member.userId) || {};
                const roleDef = roles.find(r => r.name === member.role) || {};
                const badgeLabel = roleDef.label || member.role;
                return (
                  <Card key={member.userId} style={styles.memberCard}>
                    <Card.Body style={styles.memberBody}>
                      <div style={styles.memberInfo}>
                        <FiUser size={24} style={styles.iconSecondary} />
                        <div>
                          <h6 style={styles.memberName}>{user.fullName || user.email || '—'}</h6>
                          <p style={styles.memberEmail}>{member.email}</p>
                        </div>
                      </div>

                      <div style={styles.memberActions}>
                        <Badge style={styles.badge}>{badgeLabel}</Badge>

                        {canManageRoles && member.userId !== currentUser.uid && (
                          <Dropdown
                            drop="up"
                            flip={false}
                            popperConfig={{
                              strategy: 'fixed',
                              modifiers: [
                                {
                                  name: 'flip',
                                  options: { fallbackPlacements: [] }
                                }
                              ]
                            }}
                            show={openRoleMenu === member.userId}
                            onToggle={isOpen => setOpenRoleMenu(isOpen ? member.userId : null)}
                            onSelect={newRole => {
                              handleChangeRole(member, newRole);
                              setOpenRoleMenu(null);
                            }}
                            style={{ position: 'relative', zIndex: 10000 }}
                          >
                            <Dropdown.Toggle
                              style={styles.outlineButton}
                              size="sm"
                              className="no-caret"
                            >
                              Изменить роль <FiChevronDown />
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              as={MenuPortal}
                              style={{ zIndex: 1050, marginBottom: '0.5rem' }}
                            >
                              {roles.map(r => (
                                <Dropdown.Item
                                  key={r.name}
                                  eventKey={r.name}
                                  active={r.name === member.role}
                                >
                                  {r.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}

                        {canDelete && member.userId !== currentUser.uid && (
                          <Button
                            style={styles.dangerButton}
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <FiTrash2 style={styles.iconButton} /> Удалить
                          </Button>
                        )}
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
            <Modal.Title style={styles.modalTitle}>Выбрать участника</Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <Form.Control
              type="text"
              placeholder="Поиск по имени"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <Row>
              {filteredUsers.map(user => (
                <Col key={user.id} xs={6} md={4} lg={3} style={styles.userCol}>
                  <Card style={styles.userCard}>
                    <Card.Body style={styles.userCardBody}>
                      <div>
                        <h6 style={styles.userName}>{user.fullName || user.email}</h6>
                        <div style={styles.userTeams}>
                          {team.members
                            .filter(m => m.userId === user.id)
                            .map(m => (
                              <Badge key={m.userId} style={styles.teamBadge}>
                                {team.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <Button
                        style={styles.successButton}
                        size="sm"
                        onClick={() => handleAddMember(user)}
                      >
                        <FiUserPlus style={styles.iconButton} /> Добавить
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer style={styles.modalFooter}>
            <Button style={styles.secondaryButton} onClick={() => setShowModal(false)}>
              Закрыть
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

const styles = {
  container: {
    position: 'relative',
    padding: '2rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
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
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 12px 32px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)'
  },
  cardHeader: {
    backgroundColor: 'transparent',
    borderBottom: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem'
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 800,
    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  cardBody: {
    padding: '1.5rem'
  },
  iconPrimary: {
    marginRight: '8px',
    color: 'rgba(79,70,229,0.8)'
  },
  primaryButton: {
    background: '#a3d5ff',
    color: '#222222',
    border: 'none',
    borderRadius: '14px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 6px 16px rgba(79,70,229,0.2)',
    cursor: 'pointer'
  },
  iconButton: {
    marginRight: '6px'
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  memberCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)'
  },
  memberBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem'
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  iconSecondary: {
    marginRight: '12px',
    color: '#94a3b8'
  },
  memberName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600
  },
  memberEmail: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b'
  },
  memberActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  badge: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    color: '#fff',
    borderRadius: '12px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.85rem',
    textTransform: 'capitalize'
  },
  outlineButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(163,213,255,0.8)',
    borderRadius: '12px',
    color: '#222222',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.85rem'
  },
  dangerButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(220,38,38,0.8)',
    borderRadius: '12px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.85rem'
  },
  modalTitle: {
    fontWeight: 600
  },
  modalBody: {
    padding: '1.5rem'
  },
  searchInput: {
    marginBottom: '1rem',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    padding: '0.75rem 1rem'
  },
  userCol: {
    marginBottom: '1rem'
  },
  userCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)'
  },
  userCardBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: '1rem'
  },
  userName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 500
  },
  userTeams: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem'
  },
  teamBadge: {
    backgroundColor: 'rgba(241,245,249,0.8)',
    color: '#475569',
    borderRadius: '8px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem'
  },
  successButton: {
    background: '#a3d5ff',
    color: '#22222',
    border: 'none',
    borderRadius: '14px',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  secondaryButton: {
    backgroundColor: 'rgba(241,245,249,0.8)',
    color: '#475569',
    border: 'none',
    borderRadius: '14px',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  modalFooter: {
    padding: '1rem'
  }
};

export default TeamMembers;







