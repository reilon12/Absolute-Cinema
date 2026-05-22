const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No estás autenticado. Por favor inicia sesión.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'absolute_cinema_super_secret_key_12345');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cinemaId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'El usuario perteneciente a este token ya no existe.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado.',
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para realizar esta acción.',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
