const prisma = require('../../config/db');

const getCinemas = async (req, res) => {
  try {
    const cinemas = await prisma.cinema.findMany({
      include: {
        _count: {
          select: {
            movies: true,
            showtimes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      results: cinemas.length,
      data: { cinemas },
    });
  } catch (error) {
    console.error('Error al obtener cines:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al obtener la lista de cines.',
    });
  }
};

const createCinema = async (req, res) => {
  try {
    const { name, slug, address } = req.body;

    if (!name || !slug || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, proporciona el nombre, slug y dirección del cine.',
      });
    }

    // Verify slug uniqueness
    const existingCinema = await prisma.cinema.findUnique({
      where: { slug },
    });

    if (existingCinema) {
      return res.status(400).json({
        status: 'error',
        message: 'El identificador (slug) ya está en uso. Elige otro.',
      });
    }

    const newCinema = await prisma.cinema.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        address,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { cinema: newCinema },
    });
  } catch (error) {
    console.error('Error al registrar cine:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al registrar el cine.',
    });
  }
};

module.exports = {
  getCinemas,
  createCinema,
};
