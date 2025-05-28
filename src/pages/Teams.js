// src/Teams.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Spinner
} from "react-bootstrap";
import { FiUsers, FiPlus, FiLogIn, FiArrowRight } from "react-icons/fi";

const Teams = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentUser) return;
      const q = query(collection(db, "teams"));
      const snap = await getDocs(q);
      const userTeams = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(team =>
          team.members.some(m => m.userId === currentUser.uid)
        );
      setTeams(userTeams);
      setLoading(false);
    };
    fetchTeams();
  }, [currentUser]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return alert("Введите название команды");
    const newTeam = {
      name: newTeamName.trim(),
      companyId: "company123",
      joinCode: Math.random().toString(36).substring(2, 8),
      members: [{ userId: currentUser.uid, role: "owner" }],
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "teams"), newTeam);
    navigate(`/team/${docRef.id}`);
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return alert("Введите код команды");
    const snap = await getDocs(collection(db, "teams"));
    const found = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .find(team => team.joinCode === joinCode.trim());
    if (!found) return alert("Команда не найдена");
    if (found.members.some(m => m.userId === currentUser.uid))
      return alert("Вы уже в этой команде");
    const updated = [...found.members, { userId: currentUser.uid, role: "member" }];
    await updateDoc(doc(db, "teams", found.id), { members: updated });
    alert(`Вы добавлены в команду "${found.name}"`);
    navigate(`/team/${found.id}`);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Мои команды</h2>

      <Row className="g-3 mb-5">
        {teams.map(team => (
          <Col key={team.id} sm={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm rounded-2 border-0">
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <Card.Title className="d-flex align-items-center">
                    <FiUsers className="me-2 text-primary" />
                    {team.name}
                  </Card.Title>
                  <Card.Text className="text-muted small">
                    Код: <strong>{team.joinCode}</strong>
                  </Card.Text>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/team/${team.id}`)}
                  className="d-flex align-items-center justify-content-center mt-3"
                >
                  Перейти <FiArrowRight className="ms-1" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="gy-4">
        <Col md={6}>
          <Card className="shadow-sm rounded-2 border-0">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <FiPlus className="me-2 text-success" /> Создать команду
              </h5>
            </Card.Header>
            <Card.Body>
              <InputGroup>
                <Form.Control
                  placeholder="Название команды"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
                <Button variant="success" onClick={handleCreateTeam}>
                  Создать
                </Button>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm rounded-2 border-0">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <FiLogIn className="me-2 text-info" /> Присоединиться
              </h5>
            </Card.Header>
            <Card.Body>
              <InputGroup>
                <Form.Control
                  placeholder="Код команды"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                />
                <Button variant="info" onClick={handleJoinTeam}>
                  Войти
                </Button>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Teams;


