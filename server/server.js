const express = require('express');
const cors = require('cors');
const path = require('path');

// Импорт маршрутов
const surveyRoutes = require('./routes/surveyRoutes');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Маршруты API
app.use('/api/surveys', surveyRoutes);

// Обслуживание React приложения
app.use(express.static(path.join(__dirname, '../dist')));

// Для всех остальных маршрутов отправляем React приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from ../dist`);
});