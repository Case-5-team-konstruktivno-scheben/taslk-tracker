// src/components/FriendRequests.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";  // добавлен импорт addDoc
import { useAuth } from "../context/AuthContext";  // добавлен импорт useAuth
import { acceptFriendRequest, rejectFriendRequest } from "../firebaseConfig";  // оставлен по вашему запросу

const FriendRequests = () => {
  const { currentUser } = useAuth();  // получаем текущего пользователя
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      try {
        // загружаем только входящие заявки для текущего пользователя
        const q = query(
          collection(db, "friendRequests"),
          where("toEmail", "==", currentUser.email),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const loadedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(loadedRequests);
      } catch (error) {
        console.error("Ошибка при загрузке запросов в друзья:", error);
      }
    };

    fetchRequests();
  }, [currentUser]);

  // принять запрос: добавить в коллекцию friends/{currentUser.uid}/list и friends/{fromUserId}/list, затем пометить заявку
  const handleAcceptRequest = async (request) => {
    try {
      // добавляем запись в friends/{currentUser.uid}/list
      await addDoc(collection(db, "friends", currentUser.uid, "list"), {
        id: request.from,
        email: request.fromEmail || ""
      });

      // добавляем запись обратно отправителю в friends/{fromUserId}/list
      await addDoc(collection(db, "friends", request.from, "list"), {
        id: currentUser.uid,
        email: currentUser.email
      });

      // обновляем статус заявки
      const requestRef = doc(db, "friendRequests", request.id);
      await updateDoc(requestRef, { status: "accepted" });

      // удаляем из локального состояния
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      console.error("Ошибка при принятии запроса:", err);
    }
  };

  // отклонить запрос: просто пометить заявку
  const handleRejectRequest = async (request) => {
    try {
      const requestRef = doc(db, "friendRequests", request.id);
      await updateDoc(requestRef, { status: "rejected" });
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      console.error("Ошибка при отклонении запроса:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Запросы в друзья</h1>
      {requests.length > 0 ? (
        requests.map(req => (
          <div
            key={req.id}
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>От: {req.fromEmail || req.from}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleAcceptRequest(req)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Принять
              </button>
              <button
                onClick={() => handleRejectRequest(req)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Отклонить
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Нет активных запросов в друзья</p>
      )}
    </div>
  );
};

export default FriendRequests;
