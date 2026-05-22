require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎬 ABSOLUTE CINEMA MONOLITH ACTIVE      `);
  console.log(`🚀 Server listening on port ${PORT}      `);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
