import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

// Импортируем AuthProvider из AuthContext.js
import { AuthProvider } from './context/AuthContext';  // Путь к AuthContext

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Оборачиваем приложение в AuthProvider, чтобы контекст был доступен во всем приложении */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Если хотите начать измерение производительности в вашем приложении, передайте функцию
// для записи результатов (например, reportWebVitals(console.log))
// или отправьте на endpoint аналитики. Узнайте больше: https://bit.ly/CRA-vitals
reportWebVitals();
