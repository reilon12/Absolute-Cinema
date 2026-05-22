const prisma = require('../../config/db');

const getMovies = async (req, res) => {
  try {
    const { cinemaId, slug } = req.query;

    const whereClause = {};

    if (cinemaId) {
      whereClause.cinemaId = parseInt(cinemaId);
    } else if (slug) {
      whereClause.cinema = { slug };
    }

    const movies = await prisma.movie.findMany({
      where: whereClause,
      include: {
        cinema: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      results: movies.length,
      data: { movies },
    });
  } catch (error) {
    console.error('Error al obtener películas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la lista de películas.',
    });
  }
};

const getMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: {
        cinema: true,
        showtimes: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Película no encontrada.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { movie },
    });
  } catch (error) {
    console.error('Error al obtener película:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener detalles de la película.',
    });
  }
};

const createMovie = async (req, res) => {
  try {
    const { title, description, duration, rating, genre, imageUrl } = req.body;

    // Get cinemaId from user (or request body if superadmin)
    let targetCinemaId = req.user.cinemaId;

    if (req.user.role === 'SUPERADMIN' && req.body.cinemaId) {
      targetCinemaId = parseInt(req.body.cinemaId);
    }

    if (!targetCinemaId) {
      return res.status(400).json({
        status: 'error',
        message: 'Debes pertenecer a un cine para crear películas o especificar un ID de cine.',
      });
    }

    if (!title || !description || !duration || !rating || !genre) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor completa todos los campos obligatorios.',
      });
    }

    const newMovie = await prisma.movie.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        rating,
        genre,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        cinemaId: targetCinemaId,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { movie: newMovie },
    });
  } catch (error) {
    console.error('Error al crear película:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la película.',
    });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, rating, genre, imageUrl } = req.body;

    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Película no encontrada.',
      });
    }

    // Verify ownership
    if (req.user.role !== 'SUPERADMIN' && movie.cinemaId !== req.user.cinemaId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para modificar una película de otro cine.',
      });
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        duration: duration ? parseInt(duration) : undefined,
        rating,
        genre,
        imageUrl,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { movie: updatedMovie },
    });
  } catch (error) {
    console.error('Error al actualizar película:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la película.',
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Película no encontrada.',
      });
    }

    // Verify ownership
    if (req.user.role !== 'SUPERADMIN' && movie.cinemaId !== req.user.cinemaId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para eliminar una película de otro cine.',
      });
    }

    await prisma.movie.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Película eliminada correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar película:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar la película.',
    });
  }
};

module.exports = {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
};
