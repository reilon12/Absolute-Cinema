const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const movieRoutes = require('./modules/movies/movies.routes');
const showRoutes = require('./modules/shows/shows.routes');
const ticketRoutes = require('./modules/tickets/tickets.routes');
const saasRoutes = require('./modules/saas/saas.routes');
const profileRoutes = require('./modules/profile/profile.routes');
const watchlistRoutes = require('./modules/watchlist/watchlist.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const requestsRoutes = require('./modules/requests/requests.routes');
const recommendationsRoutes = require('./modules/recommendations/recommendations.routes');
const eventsRoutes = require('./modules/events/events.routes');
const socialRoutes = require('./modules/social/social.routes');
const rewardsRoutes = require('./modules/rewards/rewards.routes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/rewards', rewardsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Absolute Cinema API operational.',
    timestamp: new Date()
  });
});

// Fallback Route
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Algo salió mal en el servidor.'
  });
});

module.exports = app;
