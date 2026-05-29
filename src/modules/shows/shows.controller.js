const prisma = require('../../config/db');

const getShowtimes = async (req, res) => {
  try {
    const { cinemaId, movieId, date } = req.query;

    const whereClause = {};

    if (cinemaId) {
      whereClause.cinemaId = parseInt(cinemaId);
    }
    if (movieId) {
      whereClause.movieId = parseInt(movieId);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const showtimes = await prisma.showtime.findMany({
      where: whereClause,
      include: {
        movie: {
          select: {
            title: true,
            description: true,
            genre: true,
            imageUrl: true,
            duration: true,
            rating: true,
          },
        },
        cinema: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      results: showtimes.length,
      data: { showtimes },
    });
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la lista de funciones.',
    });
  }
};

const getShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await prisma.showtime.findUnique({
      where: { id: parseInt(id) },
      include: {
        movie: true,
        cinema: true,
        tickets: {
          select: {
            row: true,
            col: true,
            seatLabel: true,
            status: true,
          },
        },
      },
    });

    if (!showtime) {
      return res.status(404).json({
        status: 'error',
        message: 'Función no encontrada.',
      });
    }

    // Dynamic seat layout generation & mapping occupied seats
    const totalSeats = showtime.rows * showtime.cols;
    const occupiedSeats = showtime.tickets.filter((t) => t.status === 'CONFIRMED' || t.status === 'RESERVED');
    const availableSeatsCount = totalSeats - occupiedSeats.length;

    return res.status(200).json({
      status: 'success',
      data: {
        showtime,
        occupancy: {
          total: totalSeats,
          occupied: occupiedSeats.length,
          available: availableSeatsCount,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener función:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener detalles de la función.',
    });
  }
};

const createShowtime = async (req, res) => {
  try {
    const { movieId, roomName, startTime, ticketPrice, rows, cols } = req.body;

    let targetCinemaId = req.user.cinemaId;
    if (req.user.role === 'SUPERADMIN' && req.body.cinemaId) {
      targetCinemaId = parseInt(req.body.cinemaId);
    }

    if (!targetCinemaId) {
      return res.status(400).json({
        status: 'error',
        message: 'Debes pertenecer a un cine para crear funciones.',
      });
    }

    if (!movieId || !roomName || !startTime || !ticketPrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor proporciona película, sala, hora de inicio y precio.',
      });
    }

    // Verify if movie belongs to the same cinema
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(movieId) },
    });

    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Película no encontrada.',
      });
    }

    if (req.user.role !== 'SUPERADMIN' && movie.cinemaId !== targetCinemaId) {
      return res.status(403).json({
        status: 'error',
        message: 'La película especificada no pertenece a tu cine.',
      });
    }

    const newShowtime = await prisma.showtime.create({
      data: {
        movieId: parseInt(movieId),
        roomName,
        startTime: new Date(startTime),
        ticketPrice: parseFloat(ticketPrice),
        rows: rows ? parseInt(rows) : 8,
        cols: cols ? parseInt(cols) : 10,
        cinemaId: targetCinemaId,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { showtime: newShowtime },
    });
  } catch (error) {
    console.error('Error al crear función:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la función.',
    });
  }
};

const updateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomName, startTime, ticketPrice, rows, cols } = req.body;

    const showtime = await prisma.showtime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!showtime) {
      return res.status(404).json({
        status: 'error',
        message: 'Función no encontrada.',
      });
    }

    // Verify ownership
    if (req.user.role !== 'SUPERADMIN' && showtime.cinemaId !== req.user.cinemaId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para modificar una función de otro cine.',
      });
    }

    const updatedShowtime = await prisma.showtime.update({
      where: { id: parseInt(id) },
      data: {
        roomName,
        startTime: startTime ? new Date(startTime) : undefined,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : undefined,
        rows: rows ? parseInt(rows) : undefined,
        cols: cols ? parseInt(cols) : undefined,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { showtime: updatedShowtime },
    });
  } catch (error) {
    console.error('Error al actualizar función:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la función.',
    });
  }
};

const deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await prisma.showtime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!showtime) {
      return res.status(404).json({
        status: 'error',
        message: 'Función no encontrada.',
      });
    }

    // Verify ownership
    if (req.user.role !== 'SUPERADMIN' && showtime.cinemaId !== req.user.cinemaId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para eliminar una función de otro cine.',
      });
    }

    await prisma.showtime.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Función eliminada correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar función:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar la función.',
    });
  }
};

module.exports = {
  getShowtimes,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
