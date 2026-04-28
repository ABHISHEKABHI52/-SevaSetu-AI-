require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const taskRoutes = require('./routes/taskRoutes');
const matchingRoutes = require('./routes/matchingRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/matching', matchingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
