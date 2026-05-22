const prisma = require('../../config/db');

const getMyHistory = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: {
        showtime: {
          include: {
            movie: {
              select: {
                title: true,
                imageUrl: true,
              },
            },
            cinema: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets },
    });
  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al obtener el historial de compras.',
    });
  }
};

const getSalesDashboard = async (req, res) => {
  try {
    // Only available to admin
    let targetCinemaId = req.user.cinemaId;

    if (req.user.role === 'SUPERADMIN' && req.query.cinemaId) {
      targetCinemaId = parseInt(req.query.cinemaId);
    }

    if (!targetCinemaId) {
      return res.status(400).json({
        status: 'error',
        message: 'No perteneces a un cine registrado.',
      });
    }

    // Fetch tickets for showtimes in this cinema
    const tickets = await prisma.ticket.findMany({
      where: {
        showtime: {
          cinemaId: targetCinemaId,
        },
      },
      include: {
        showtime: {
          include: {
            movie: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate statistics
    const totalSales = tickets.reduce((sum, t) => sum + t.pricePaid, 0);
    const ticketsCount = tickets.length;

    // Sales by movie
    const salesByMovie = {};
    tickets.forEach((t) => {
      const movieTitle = t.showtime.movie.title;
      if (!salesByMovie[movieTitle]) {
        salesByMovie[movieTitle] = {
          title: movieTitle,
          sales: 0,
          quantity: 0,
        };
      }
      salesByMovie[movieTitle].sales += t.pricePaid;
      salesByMovie[movieTitle].quantity += 1;
    });

    return res.status(200).json({
      status: 'success',
      data: {
        tickets,
        stats: {
          totalSales,
          ticketsCount,
          movieStats: Object.values(salesByMovie),
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener métricas de ventas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al obtener las métricas de ventas.',
    });
  }
};

const bookTickets = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body; // seats: [{ row: 1, col: 2, label: 'B-3' }]

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de reserva incompletos. Se requiere ID de función y selección de asientos.',
      });
    }

    const showtime = await prisma.showtime.findUnique({
      where: { id: parseInt(showtimeId) },
      include: {
        movie: true,
        cinema: true,
      },
    });

    if (!showtime) {
      return res.status(404).json({
        status: 'error',
        message: 'La función seleccionada no existe.',
      });
    }

    // Validate that seats are within grid bounds
    for (const seat of seats) {
      if (seat.row < 0 || seat.row >= showtime.rows || seat.col < 0 || seat.col >= showtime.cols) {
        return res.status(400).json({
          status: 'error',
          message: `El asiento ${seat.label || 'seleccionado'} está fuera de los límites de la sala.`,
        });
      }
    }

    // Execute booking transaction
    const createdTickets = await prisma.$transaction(async (tx) => {
      // 1. Double check occupancy in the transaction to prevent race conditions
      const occupiedSeats = await tx.ticket.findMany({
        where: {
          showtimeId: showtime.id,
          OR: seats.map((s) => ({
            row: s.row,
            col: s.col,
          })),
        },
      });

      if (occupiedSeats.length > 0) {
        throw new Error('ONE_OR_MORE_SEATS_ALREADY_OCCUPIED');
      }

      // 2. Book each seat
      const ticketCreations = seats.map((seat) => {
        return tx.ticket.create({
          data: {
            showtimeId: showtime.id,
            userId: req.user.id,
            row: seat.row,
            col: seat.col,
            seatLabel: seat.label || `Fila ${seat.row + 1} Col ${seat.col + 1}`,
            pricePaid: showtime.ticketPrice,
          },
        });
      });

      return Promise.all(ticketCreations);
    });

    // Mock Email notification logging to make nodemail logic visible without crashes
    console.log(`[EMAIL SIMULATION] enviando correo a: ${req.user.email}`);
    console.log(`[EMAIL SIMULATION] Compra confirmada para ${showtime.movie.title} en ${showtime.cinema.name}`);
    console.log(`[EMAIL SIMULATION] Entradas: ${seats.map(s => s.label).join(', ')}`);

    return res.status(201).json({
      status: 'success',
      message: '¡Entradas compradas con éxito!',
      data: {
        tickets: createdTickets,
        showtime: {
          movieTitle: showtime.movie.title,
          cinemaName: showtime.cinema.name,
          startTime: showtime.startTime,
          roomName: showtime.roomName,
        },
      },
    });
  } catch (error) {
    console.error('Error al comprar entradas:', error);

    if (error.message === 'ONE_OR_MORE_SEATS_ALREADY_OCCUPIED' || error.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'Uno o más asientos ya han sido reservados por otro cliente. Por favor, selecciona otros asientos.',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al procesar tu compra.',
    });
  }
};

module.exports = {
  getMyHistory,
  getSalesDashboard,
  bookTickets,
};
