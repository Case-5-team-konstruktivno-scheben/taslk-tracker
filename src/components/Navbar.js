import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiUsers } from "react-icons/fi";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [userPoints, setUserPoints] = useState(null);
  const [userName, setUserName] = useState("");
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDocs(collection(db, "teams"));
        const userTeams = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(team => team.members.some(m => m.userId === user.uid));
        setTeams(userTeams);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserPoints(data.points || 0);
          setUserName(data.fullName || user.displayName || "");
        } else {
          setUserPoints(0);
          setUserName(user.displayName || "");
        }
      } else {
        setTeams([]);
        setUserPoints(null);
        setUserName("");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        <div
          style={styles.logo}
          onClick={() => navigate("/")}
        >
          RunPlan
        </div>
        {userName && (
          <span style={styles.userName}>
            {userName}
          </span>
        )}
      </div>

      <div style={styles.links}>
        {currentUser ? (
          <>
            {teams.length <= 1 ? (
              <Link to="/teams" style={styles.link}>
                <FiUsers /> Моя команда
              </Link>
            ) : (
              <div
                style={styles.dropdown}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <span style={styles.link}>
                  <FiUsers /> Мои команды
                </span>
                {hovered && (
                  <div style={styles.dropdownContent}>
                    <Link to="/teams" style={styles.dropdownItem}>
                      <strong>Все команды</strong>
                    </Link>
                    {teams.map(team => (
                      <Link
                        key={team.id}
                        to={`/team/${team.id}`}
                        style={styles.dropdownItem}
                      >
                        {team.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <span style={styles.points}>
              Очки: {userPoints ?? "..."}
            </span>

            <span onClick={handleLogout} style={styles.link}>
              <FiLogOut /> Выйти
            </span>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Войти</Link>
            <Link to="/register" style={styles.link}>Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(241, 245, 249, 0.8)",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logo: {
    fontWeight: 800,
    fontSize: "2rem",
    cursor: "pointer",
    background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  userName: {
    fontWeight: 500,
    fontSize: "1.25rem",
    color: "#475569",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    position: "relative",
  },
  link: {
    textDecoration: "none",
    color: "#475569",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    cursor: "pointer",
    transition: "color 0.2s, transform 0.2s",
    userSelect: "none",
  },
  points: {
    fontWeight: 600,
    background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  dropdown: {
    position: "relative",
    display: "inline-block",
  },
  dropdownContent: {
    position: "absolute",
    top: "110%",
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(241, 245, 249, 0.8)",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
    borderRadius: "14px",
    padding: "0.5rem 0",
    marginTop: "0.25rem",
    minWidth: "200px",
    zIndex: 1001,
  },
  dropdownItem: {
    display: "block",
    padding: "0.75rem 1rem",
    color: "#475569",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s, color 0.2s",
    cursor: "pointer",
  },
};

export default Navbar;

