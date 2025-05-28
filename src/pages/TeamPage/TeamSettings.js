import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  deleteField
} from 'firebase/firestore';
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Modal,
  InputGroup,
  Table
} from 'react-bootstrap';
import {
  FiSettings,
  FiSave,
  FiInfo,
  FiPlus,
  FiEdit,
  FiTrash
} from 'react-icons/fi';
import { ROLE_TEMPLATES } from '../../config/roleTemplates';

const AVAILABLE_PERMISSIONS = [
  { key: 'createTask', label: 'Создавать задачи' },
  { key: 'editTask', label: 'Изменять задачи' },
  { key: 'deleteTask', label: 'Удалять задачи' },
  { key: 'completeTask', label: 'Завершать задачи' },
  { key: 'manageRoles', label: 'Управлять ролями' },
  { key: 'changeSettings', label: 'Менять настройки' }
];

const TeamSettings = ({ teamId, role }) => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleRights, setNewRoleRights] = useState(
    AVAILABLE_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {})
  );
  const [editingRole, setEditingRole] = useState(null);

  const flattenRoles = rolesList => {
    const byId = Object.fromEntries(rolesList.map(r => [r.id, r]));
    const getRights = (role, visited = new Set()) => {
      if (visited.has(role.id)) return {};
      visited.add(role.id);
      let rights = { ...(role.rights || {}) };
      (role.inherits || []).forEach(parentId => {
        const parent = byId[parentId];
        if (parent) {
          rights = { ...getRights(parent, visited), ...rights };
        }
      });
      return rights;
    };
    return rolesList.map(r => ({
      ...r,
      effectiveRights: getRights(r)
    }));
  };

  useEffect(() => {
    const teamRef = doc(db, 'teams', teamId);

    const unsub = onSnapshot(teamRef, snapshot => {
      const data = snapshot.data() || {};
      setName(data.name || '');
      setDescription(data.description || '');

      const settings = data.settings || {};
      const rolesMap = settings.roles || {};
      const roleList = Object.entries(rolesMap).map(
        ([key, { label, rights, inherits }]) => ({
          id: key,
          name: label,
          rights: rights || {},
          inherits: inherits || []
        })
      );

      setRoles(flattenRoles(roleList));
      setLoading(false);
    });

    const categoriesRef = collection(db, 'categories');
    const unsubCategories = onSnapshot(categoriesRef, snapshot => {
      const categoryList = snapshot.docs
        .filter(d => d.data().teamId === teamId)
        .map(d => ({ id: d.id, ...d.data() }));
      setCategories(categoryList);
    });

    return () => {
      unsub();
      unsubCategories();
    };
  }, [teamId]);

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      const cmp = a.name
        .toLowerCase()
        .localeCompare(b.name.toLowerCase(), 'ru', { sensitivity: 'base' });
      return cmp !== 0
        ? cmp
        : a.id.localeCompare(b.id, 'ru', { sensitivity: 'base' });
    });
  }, [roles]);

  const handleSave = async e => {
    e.preventDefault();
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      name,
      description
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

  const handleSaveCategory = async () => {
    if (!editingCategory?.name.trim()) return;
    const categoryRef = doc(db, 'categories', editingCategory.id);
    await updateDoc(categoryRef, {
      name: editingCategory.name.trim()
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = async categoryId => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      const categoryRef = doc(db, 'categories', categoryId);
      await deleteDoc(categoryRef);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    const teamRef = doc(db, 'teams', teamId);
    const newKey = newRoleName.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`;
    await updateDoc(teamRef, {
      [`settings.roles.${newKey}`]: {
        label: newRoleName.trim(),
        rights: newRoleRights,
        inherits: []
      }
    });
    setNewRoleName('');
    setNewRoleRights(
      AVAILABLE_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {})
    );
  };

  const handleSaveRole = async () => {
    if (!editingRole?.name.trim()) return;
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      [`settings.roles.${editingRole.id}.label`]: editingRole.name.trim(),
      [`settings.roles.${editingRole.id}.rights`]: editingRole.rights,
      [`settings.roles.${editingRole.id}.inherits`]: editingRole.inherits || []
    });
    setEditingRole(null);
  };

  const handleDeleteRole = async roleId => {
    if (window.confirm('Вы уверены, что хотите удалить эту роль?')) {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        [`settings.roles.${roleId}`]: deleteField()
      });
    }
  };

  const handleTemplateSelect = async templateKey => {
    if (!templateKey) return;
    const tpl = ROLE_TEMPLATES[templateKey];
    const newKey = templateKey + `-${Date.now()}`;
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      [`settings.roles.${newKey}`]: {
        label: tpl.label,
        rights: tpl.rights,
        inherits: tpl.inherits || []
      }
    });
  };

  if (loading) {
    return (
      <Container style={styles.loadingContainer}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!['owner', 'manager'].includes(role)) {
    return (
      <Container style={styles.container}>
        <div style={styles.decorCircleTop} />
        <div style={styles.decorCircleBottom} />
        <Alert style={styles.alertWarning}>
          <FiInfo style={styles.iconInfo} /> У вас нет прав для управления настройками.
        </Alert>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <div style={styles.decorCircleTop} />
      <div style={styles.decorCircleBottom} />

      <Card style={styles.card}>
        <Card.Header style={styles.cardHeader}>
          <FiSettings style={styles.iconPrimary} size={22} />
          <h5 style={styles.heading}>Настройки команды</h5>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          <Form onSubmit={handleSave}>
            <Form.Group controlId="teamName" style={styles.formGroup}>
              <Form.Label style={styles.formLabel}>Название команды</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Введите название"
                style={styles.formControl}
              />
            </Form.Group>

            <Form.Group controlId="teamDescription" style={styles.formGroup}>
              <Form.Label style={styles.formLabel}>Описание команды</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Кратко о команде"
                style={styles.formControl}
              />
            </Form.Group>

            <div style={styles.formActions}>
              <Button type="submit" style={styles.primaryButton}>
                <FiSave style={styles.iconButton} /> Сохранить
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card style={styles.cardSection}>
        <Card.Header style={styles.cardSectionHeader}>
          <h6 style={styles.sectionHeading}>Готовые шаблоны ролей</h6>
        </Card.Header>
        <Card.Body style={styles.cardSectionBody}>
          <Form.Select
            onChange={e => handleTemplateSelect(e.target.value)}
            style={styles.formSelect}
          >
            <option value="">— выбрать шаблон —</option>
            {Object.entries(ROLE_TEMPLATES).map(([key, tpl]) => (
              <option key={key} value={key}>{tpl.label}</option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      <Card style={styles.cardSection}>
        <Card.Header style={styles.cardSectionHeader}>
          <h6 style={styles.sectionHeading}>Создать свою роль</h6>
        </Card.Header>
        <Card.Body style={styles.cardSectionBody}>
          <InputGroup style={styles.inputGroup}>
            <Form.Control
              type="text"
              placeholder="Название роли"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              style={styles.formControl}
            />
            <Button style={styles.outlineButton} onClick={handleAddRole}>
              <FiPlus style={styles.iconButton} /> Добавить роль
            </Button>
          </InputGroup>
        </Card.Body>
      </Card>

      <Card style={styles.cardSection}>
        <Card.Header style={styles.cardSectionHeader}>
          <h6 style={styles.sectionHeading}>Категории задач</h6>
        </Card.Header>
        <Card.Body style={styles.cardSectionBody}>
          <InputGroup style={styles.inputGroup}>
            <Form.Control
              type="text"
              placeholder="Название категории"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              style={styles.formControl}
            />
            <Button style={styles.outlineButton} onClick={handleAddCategory}>
              <FiPlus style={styles.iconButton} /> Добавить
            </Button>
          </InputGroup>

          <ListGroup style={styles.listGroup}>
            {categories.map(cat => (
              <ListGroup.Item key={cat.id} style={styles.listGroupItem}>
                <span>{cat.name}</span>
                <div>
                  <Button
                    style={styles.outlineButtonSmall}
                    onClick={() => setEditingCategory(cat)}
                  >
                    <FiEdit />
                  </Button>
                  <Button
                    style={styles.dangerButtonSmall}
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <FiTrash />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Card style={styles.cardSection}>
        <Card.Header style={styles.cardSectionHeader}>
          <h6 style={styles.sectionHeading}>Матрица прав ролей</h6>
        </Card.Header>
        <Card.Body style={styles.cardSectionBody}>
          <Table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Роль</th>
                {AVAILABLE_PERMISSIONS.map(p => (
                  <th key={p.key} style={styles.tableHeader}>{p.label}</th>
                ))}
                <th style={styles.tableHeader}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoles.map(r => (
                <tr key={r.id}>
                  <td style={styles.tableCell}><strong>{r.name}</strong></td>
                  {AVAILABLE_PERMISSIONS.map(p => (
                    <td key={p.key} style={styles.tableCellCenter}>
                      <Form.Check
                        type="checkbox"
                        checked={r.effectiveRights?.[p.key] || false}
                        onChange={async e => {
                          const teamRef = doc(db, 'teams', teamId);
                          const updated = { ...(r.rights || {}), [p.key]: e.target.checked };
                          await updateDoc(teamRef, {
                            [`settings.roles.${r.id}.rights`]: updated
                          });
                        }}
                        style={styles.checkbox}
                      />
                    </td>
                  ))}
                  <td style={styles.tableCellCenter}>
                    <Button style={styles.outlineButtonSmall} onClick={() => setEditingRole(r)}>
                      <FiEdit />
                    </Button>
                    <Button style={styles.dangerButtonSmall} onClick={() => handleDeleteRole(r.id)}>
                      <FiTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={editingCategory !== null} onHide={() => setEditingCategory(null)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>Редактировать категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {editingCategory && (
            <Form>
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>Название категории</Form.Label>
                <Form.Control
                  value={editingCategory.name}
                  onChange={e =>
                    setEditingCategory(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                  style={styles.formControl}
                />
              </Form.Group>
              <div style={styles.formActions}>
                <Button style={styles.primaryButton} onClick={handleSaveCategory}>
                  Сохранить
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={editingRole !== null} onHide={() => setEditingRole(null)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>Редактировать роль</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {editingRole && (
            <Form>
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>Название роли</Form.Label>
                <Form.Control
                  value={editingRole.name}
                  onChange={e =>
                    setEditingRole(prev => ({ ...prev, name: e.target.value }))
                  }
                  style={styles.formControl}
                />
              </Form.Group>
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  Наследует роли (IDs через запятую)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={(editingRole.inherits || []).join(',')}
                  onChange={e =>
                    setEditingRole(prev => ({
                      ...prev,
                      inherits: e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                    }))
                  }
                  style={styles.formControl}
                />
              </Form.Group>
              {AVAILABLE_PERMISSIONS.map(p => (
                <Form.Group key={p.key} style={styles.formCheckGroup}>
                  <Form.Check
                    type="checkbox"
                    label={p.label}
                    checked={editingRole.rights?.[p.key] || false}
                    onChange={e =>
                      setEditingRole(prev => ({
                        ...prev,
                        rights: {
                          ...prev.rights,
                          [p.key]: e.target.checked
                        }
                      }))
                    }
                    style={styles.checkbox}
                  />
                </Form.Group>
              ))}
              <div style={styles.formActions}>
                <Button style={styles.primaryButton} onClick={handleSaveRole}>
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

const styles = {
  container: {
    position: 'relative',
    padding: '2rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    overflow: 'hidden'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  alertWarning: {
    background: 'rgba(254,243,199,0.95)',
    border: '1px solid rgba(250,204,21,0.4)',
    borderRadius: '12px',
    padding: '1rem',
    fontSize: '1rem'
  },
  iconInfo: {
    marginRight: '8px',
    color: '#f59e0b'
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 12px 32px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)',
    marginBottom: '1.5rem'
  },
  cardSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    border: '1px solid rgba(241,245,249,0.8)',
    boxShadow: '0 12px 32px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(8px)',
    marginTop: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottom: 'none',
    padding: '1rem 1.5rem'
  },
  cardSectionHeader: {
    backgroundColor: 'transparent',
    borderBottom: 'none',
    padding: '0.75rem 1.5rem'
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 800,
    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  sectionHeading: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0f172a'
  },
  iconPrimary: {
    marginRight: '8px',
    color: 'rgba(79,70,229,0.8)'
  },
  cardBody: {
    padding: '1.5rem'
  },
  cardSectionBody: {
    padding: '1rem 1.5rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  formLabel: {
    marginBottom: '0.5rem',
    fontWeight: 500
  },
  formControl: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.6rem 1rem',
    fontSize: '0.95rem'
  },
  formSelect: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.6rem 1rem',
    fontSize: '0.95rem'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '0.6rem 1.2rem',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 6px 16px rgba(79,70,229,0.2)',
    cursor: 'pointer'
  },
  outlineButton: {
    background: 'transparent',
    border: '1px solid rgba(99,102,241,0.8)',
    borderRadius: '14px',
    color: '#4f46e5',
    padding: '0.5rem 1rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  outlineButtonSmall: {
    background: 'transparent',
    border: '1px solid rgba(99,102,241,0.8)',
    borderRadius: '12px',
    color: '#4f46e5',
    padding: '0.4rem',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dangerButtonSmall: {
    background: 'transparent',
    border: '1px solid rgba(220,38,38,0.8)',
    borderRadius: '12px',
    color: '#dc2626',
    padding: '0.4rem',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '0.5rem'
  },
  iconButton: {
    marginRight: '6px'
  },
  listGroup: {
    padding: 0
  },
  listGroupItem: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.75rem 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: 0
  },
  tableHeader: {
    backgroundColor: 'rgba(241,245,249,0.8)',
    padding: '0.75rem',
    fontWeight: 600,
    textAlign: 'center',
    border: '1px solid rgba(241,245,249,0.8)'
  },
  tableCell: {
    padding: '0.75rem',
    border: '1px solid rgba(241,245,249,0.8)'
  },
  tableCellCenter: {
    padding: '0.75rem',
    border: '1px solid rgba(241,245,249,0.8)',
    textAlign: 'center'
  },
  formCheckGroup: {
    marginBottom: '0.5rem'
  },
  checkbox: {
    display: 'block',
    margin: '0 auto'
  },
  modalHeader: {
    borderBottom: 'none'
  },
  modalTitle: {
    fontWeight: 600
  },
  modalBody: {
    padding: '1.5rem'
  }
};

export default TeamSettings;



