
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Spinner } from "react-bootstrap";

const RedirectToTeam = () => {
  const { currentUser } = useAuth();
  const [firstTeamId, setFirstTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const snap = await getDocs(collection(db, "teams"));
        const userTeams = snap.docs.filter(teamDoc =>
          (teamDoc.data().members || []).some(m => m.userId === currentUser.uid)
        );
        if (userTeams.length > 0) {
          setFirstTeamId(userTeams[0].id);
        }
      } catch (err) {
        console.error("Ошибка при загрузке команд:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return firstTeamId
    ? <Navigate to={`/team/${firstTeamId}`} replace />
    : <Navigate to="/teams" replace />;
};

export default RedirectToTeam;
