// src/pages/TeamPage/TeamPage.js

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
  const { currentUser } = useAuth();
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [role, setRole] = useState("member");

  // Загрузка данных команды и вычисление роли текущего пользователя
  useEffect(() => {
    const fetchTeam = async () => {
      const teamRef = doc(db, "teams", teamId);
      const snap = await getDoc(teamRef);
      if (snap.exists()) {
        const data = snap.data();
        setTeam({ id: snap.id, ...data });
        const me = (data.members || []).find(
          m => m.userId === currentUser.uid
        );
        setRole(me?.role || "member");
      }
    };
    if (currentUser) {
      fetchTeam();
    }
  }, [teamId, currentUser]);

  // Показываем спиннер, пока не загрузился объект team
  if (!team) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  // Обработчик выхода из команды (для роли member)
  const handleLeaveTeam = async () => {
    if (!window.confirm("Вы действительно хотите покинуть команду?")) return;
    const teamRef = doc(db, "teams", teamId);
    const updatedMembers = team.members.filter(
      m => m.userId !== currentUser.uid
    );
    await updateDoc(teamRef, { members: updatedMembers });
    navigate("/teams");
  };

  // Вариант цвета бейджа в зависимости от роли
  const badgeVariant = {
    owner: "success",
    manager: "info",
    member: "secondary"
  }[role];

  return (
    <Container fluid className="px-4">
      <Card className="shadow-sm my-4 rounded-2 border-0">
        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3 px-4">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center me-3"
              onClick={() => navigate("/teams")}
            >
              <FiArrowLeft className="me-1" />
              Мои команды
            </Button>
            <FiUsers className="me-2 text-primary" size={24} />
            <h2 className="mb-0">{team.name}</h2>
          </div>
          <div className="d-flex align-items-center">
            <Badge bg={badgeVariant} className="text-capitalize me-3">
              {role}
            </Badge>
            {role === "member" && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLeaveTeam}
              >
                Выйти из команды
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Код приглашения */}
          {team.inviteCode && (
            <InputGroup className="mb-4" style={{ maxWidth: 320 }}>
              <Form.Control readOnly value={team.inviteCode} />
              <Button
                variant="outline-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(team.inviteCode);
                  alert("Код приглашения скопирован");
                }}
              >
                Скопировать код
              </Button>
            </InputGroup>
          )}

          <Tab.Container defaultActiveKey="tasks">
            <Nav variant="pills" className="mb-4 justify-content-center">
              <Nav.Item>
                <Nav.Link eventKey="tasks" className="d-flex align-items-center">
                  <FiList className="me-1" /> Задачи
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="members" className="d-flex align-items-center">
                  <FiUsers className="me-1" /> Участники
                </Nav.Link>
              </Nav.Item>
              {['owner', 'manager'].includes(role) && (
                <Nav.Item>
                  <Nav.Link
                    eventKey="settings"
                    className="d-flex align-items-center"
                  >
                    <FiSettings className="me-1" /> Настройки
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="tasks">
                <TeamTasks teamId={teamId} currentUser={currentUser} role={role} />
              </Tab.Pane>

              <Tab.Pane eventKey="members">
                <TeamMembers teamId={teamId} currentUser={currentUser} role={role} />
              </Tab.Pane>

              {['owner', 'manager'].includes(role) && (
                <Tab.Pane eventKey="settings">
                  <TeamSettings teamId={teamId} currentUser={currentUser} role={role} />
                </Tab.Pane>
              )}
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeamPage;

