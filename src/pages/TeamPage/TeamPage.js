import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import {
  Container,
  Card,
  Nav,
  Tab,
  Spinner,
  Badge,
  Button,
  InputGroup,
  Form
} from "react-bootstrap";
import { FiUsers, FiSettings, FiList, FiArrowLeft } from "react-icons/fi";

import TeamTasks from "./TeamTasks";
import TeamMembers from "./TeamMembers";
import TeamSettings from "./TeamSettings";

const TeamPage = () => {
  const { currentUser, teamPermissions } = useAuth();
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [role, setRole] = useState("member");
  const [activeKey, setActiveKey] = useState("tasks");

  useEffect(() => {
    const fetchTeam = async () => {
      const teamRef = doc(db, "teams", teamId);
      const snap = await getDoc(teamRef);
      if (snap.exists()) {
        const data = snap.data();
        setTeam({ id: snap.id, ...data });
        const me = (data.members || []).find(m => m.userId === currentUser.uid);
        setRole(me?.role || "member");
      }
    };
    if (currentUser) fetchTeam();
  }, [teamId, currentUser]);

  if (!team) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" />
      </div>
    );
  }

  const permissions = teamPermissions?.[teamId]?.[role] || {};
  const { canManageTasks, canInvite, canDelete } = permissions;

  const handleLeaveTeam = async () => {
    if (!window.confirm("Вы действительно хотите покинуть команду?")) return;
    const teamRef = doc(db, "teams", teamId);
    const updatedMembers = team.members.filter(m => m.userId !== currentUser.uid);
    await updateDoc(teamRef, { members: updatedMembers });
    navigate("/teams");
  };

  return (
    <Container fluid style={styles.container}>
      <div style={styles.decorCircleTop} />
      <div style={styles.decorCircleBottom} />

      <Card style={styles.card}>
        <Card.Header style={styles.cardHeader}>
          <div style={styles.headerLeft}>
            <Button style={styles.backButton} onClick={() => navigate("/teams")}> 
              <FiArrowLeft style={styles.iconSmall} />
              Мои команды
            </Button>
            <FiUsers style={styles.iconMedium} />
            <h2 style={styles.title}>{team.name}</h2>
          </div>
          <div style={styles.headerRight}>
            <Badge style={styles.badge}>{role}</Badge>
            {!canManageTasks && (
              <Button style={styles.outlineButton} onClick={handleLeaveTeam}>
                Выйти из команды
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body style={styles.cardBody}>
          {team.inviteCode && (
            <InputGroup style={styles.inputGroup}>
              <Form.Control
                readOnly
                value={team.inviteCode}
                style={styles.formControl}
              />
              <Button
                style={styles.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(team.inviteCode);
                  alert("Код приглашения скопирован");
                }}
              >
                Скопировать код
              </Button>
            </InputGroup>
          )}

          <Tab.Container 
            activeKey={activeKey} 
            onSelect={(k) => setActiveKey(k)}
          >
            <Nav variant="pills" style={styles.nav}>
              <Nav.Item>
                <Nav.Link
                  eventKey="tasks"
                  style={
                    activeKey === "tasks"
                      ? { ...styles.navLink, ...styles.navLinkActive }
                      : styles.navLink
                  }
                >
                  <FiList style={styles.iconSmall} /> Задачи
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="members"
                  style={
                    activeKey === "members"
                      ? { ...styles.navLink, ...styles.navLinkActive }
                      : styles.navLink
                  }
                >
                  <FiUsers style={styles.iconSmall} /> Участники
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="settings"
                  style={
                    activeKey === "settings"
                      ? { ...styles.navLink, ...styles.navLinkActive }
                      : styles.navLink
                  }
                >
                  <FiSettings style={styles.iconSmall} /> Настройки
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="tasks">
                <TeamTasks teamId={teamId} currentUser={currentUser} role={role} />
              </Tab.Pane>
              <Tab.Pane eventKey="members">
                <TeamMembers teamId={teamId} />
              </Tab.Pane>
              <Tab.Pane eventKey="settings">
                <TeamSettings teamId={teamId} role={role} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

const styles = {
  container: {
    position: "relative",
    padding: "2rem",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    overflow: "hidden",
  },
  decorCircleTop: {
    position: "absolute",
    top: "-200px",
    right: "-200px",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: "-300px",
    left: "-200px",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "24px",
    border: "1px solid rgba(241,245,249,0.8)",
    boxShadow: "0 12px 32px rgba(15,23,42,0.1)",
    backdropFilter: "blur(8px)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottom: "none",
    padding: "1rem 1.5rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "transparent",
    border: "1px solid rgba(99,102,241,0.8)",
    borderRadius: "14px",
    color: "#4f46e5",
    padding: "0.4rem 0.8rem",
    fontWeight: 500,
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#0f172a",
    background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  iconSmall: {
    fontSize: "1rem",
  },
  iconMedium: {
    fontSize: "1.5rem",
    color: "rgba(79,70,229,0.8)",
  },
  badge: {
    background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    borderRadius: "12px",
    padding: "0.25rem 0.75rem",
    textTransform: "capitalize",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  outlineButton: {
    background: "transparent",
    border: "1px solid rgba(220,38,38,0.8)",
    borderRadius: "14px",
    color: "#dc2626",
    padding: "0.4rem 0.8rem",
    fontWeight: 500,
  },
  cardBody: {
    padding: "1.5rem",
  },
  inputGroup: {
    maxWidth: "320px",
    marginBottom: "1.5rem",
  },
  formControl: {
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "0.6rem 1rem",
  },
  copyButton: {
    background: "linear-gradient(45deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "0.6rem 1rem",
    fontWeight: 500,
  },
  nav: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    justifyContent: "center",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontWeight: 500,
    color: "#475569",
    padding: "0.5rem 1rem",
    borderRadius: "14px",
    transition: "background 0.2s, color 0.2s",
  },
  navLinkActive: {
    color: "#fff",
  },
};

export default TeamPage;

