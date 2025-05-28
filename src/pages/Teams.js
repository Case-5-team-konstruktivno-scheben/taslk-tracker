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
  ButtonGroup,
  Form,
  InputGroup,
  Spinner
} from "react-bootstrap";
import { FiUsers, FiPlus, FiLogIn, FiArrowRight } from "react-icons/fi";
import "../index.css"; 

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
      roles: {
        owner: { canInvite: true, canDelete: true, canManageTasks: true },
        manager: { canInvite: true, canDelete: false, canManageTasks: true },
        member: { canInvite: false, canDelete: false, canManageTasks: false }
      },
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

  const styles = {
    container: {
      position: "relative",
      padding: "2rem",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      overflow: "hidden",
    },
    decorCircleTop: {
      position: "absolute",
      top: "-200px",
      right: "-200px",
      width: "600px",
      height: "600px",
      background:
        "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    decorCircleBottom: {
      position: "absolute",
      bottom: "-300px",
      left: "-200px",
      width: "600px",
      height: "600px",
      background:
        "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    content: {
      position: "relative",
      zIndex: 1,
    },
    heading: {
      fontSize: "2rem",
      fontWeight: 800,
      marginBottom: "1rem",
      background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "#0f172a",
    },
    row: {
      marginBottom: "2rem",
    },
    card: {
      backgroundColor: "rgba(255,255,255,0.95)",
      borderRadius: "24px",
      border: "1px solid rgba(241,245,249,0.8)",
      boxShadow: "0 12px 32px rgba(15,23,42,0.1)",
      backdropFilter: "blur(8px)",
      height: "100%",
    },
    cardBody: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "1.5rem",
    },
    teamTitle: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "0.5rem",
      fontWeight: 600,
      color: "#0f172a",
    },
    codeText: {
      fontSize: "0.9rem",
      color: "#64748b",
    },
    cardHeader: {
      backgroundColor: "transparent",
      borderBottom: "none",
      padding: "1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontWeight: 600,
      color: "#0f172a",
    },
    inputGroup: {
      display: "flex",
      gap: "0.5rem",
    },
    input: {
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      padding: "0.5rem 1rem",
      flex: 1,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.decorCircleTop} />
        <div style={styles.decorCircleBottom} />
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ ...styles.content, height: "50vh" }}
        >
          <Spinner animation="border" />
        </Container>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.decorCircleTop} />
      <div style={styles.decorCircleBottom} />

      <Container style={styles.content}>
        <h2 style={styles.heading}>Мои команды</h2>

        
        <Row className="g-3" style={styles.row}>
          {teams.map(team => (
            <Col key={team.id} sm={12} md={6} lg={4}>
              <Card style={styles.card}>
                <Card.Body style={styles.cardBody}>
                  <div>
                    <Card.Title style={styles.teamTitle}>
                      <FiUsers style={{ color: "rgba(79,70,229,0.8)" }} size={20} />
                      {team.name}
                    </Card.Title>
                    <Card.Text style={styles.codeText}>
                      Код: <strong>{team.joinCode}</strong>
                    </Card.Text>
                  </div>
                  <Button className="primary-button" onClick={() => navigate(`/team/${team.id}`)}>
                    Перейти <FiArrowRight />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        
        <Row className="gy-4">
          <Col md={6}>
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <FiPlus style={{ color: "rgba(16,185,129,0.8)" }} />
                Создать команду
              </Card.Header>
              <Card.Body style={styles.cardBody}>
                <InputGroup style={styles.inputGroup}>
                  <Form.Control
                    placeholder="Название команды"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    style={styles.input}
                  />
                  <Button className="primary-button" onClick={handleCreateTeam}>
                    Создать
                  </Button>
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <FiLogIn style={{ color: "rgba(14,165,233,0.8)" }} />
                Присоединиться
              </Card.Header>
              <Card.Body style={styles.cardBody}>
                <InputGroup style={styles.inputGroup}>
                  <Form.Control
                    placeholder="Код команды"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    style={styles.input}
                  />
                  <Button className="primary-button" onClick={handleJoinTeam}>
                    Войти
                  </Button>
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Teams;




