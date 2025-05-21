import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { auth, db } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setFullName(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Обновление имени пользователя
      if (fullName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }

      // Сменить пароль
      if (newPassword) {
        await auth.currentUser.updatePassword(newPassword);
      }

      // Обновление в базе данных
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { fullName, email });

      setSuccess("Профиль успешно обновлен!");

      // Навигация после успешного обновления профиля
      setTimeout(() => {
        navigate("/"); // Переход на главную страницу или страницу профиля
      }, 2000);
    } catch (error) {
      setError("Ошибка обновления: " + error.message);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Личный кабинет</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleUpdateProfile}>
        <Form.Group className="mb-3" controlId="formFullName">
          <Form.Label>Полное имя</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите ваше полное имя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Введите ваш email"
            value={email}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formNewPassword">
          <Form.Label>Новый пароль</Form.Label>
          <Form.Control
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Обновить профиль
        </Button>
      </Form>
    </Container>
  );
}

export default Profile;
