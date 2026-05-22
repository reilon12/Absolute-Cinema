const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'absolute_cinema_super_secret_key_12345',
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, cinemaId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, proporciona nombre, email y contraseña.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CLIENT',
        cinemaId: cinemaId ? parseInt(cinemaId) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cinemaId: true,
        createdAt: true,
      },
    });

    const token = signToken(newUser.id);

    return res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al registrar el usuario.',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, ingresa correo y contraseña.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const token = signToken(user.id);

    // Fetch client cinema details if admin
    let cinemaDetails = null;
    if (user.cinemaId) {
      cinemaDetails = await prisma.cinema.findUnique({
        where: { id: user.cinemaId },
      });
    }

    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cinemaId: user.cinemaId,
          cinema: cinemaDetails,
        },
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al iniciar sesión.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    let cinemaDetails = null;
    if (req.user.cinemaId) {
      cinemaDetails = await prisma.cinema.findUnique({
        where: { id: req.user.cinemaId },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...req.user,
          cinema: cinemaDetails,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al obtener la información del perfil.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
