const prisma = require('../../config/db');

const getRequests = async (req, res) => {
  try {
    const requests = await prisma.movieRequest.findMany({
      include: {
        movie: true,
        createdBy: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      requests.map((request) => ({
        ...request,
        voteCount: request.votes.length,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las solicitudes de película' });
  }
};

const createRequest = async (req, res) => {
  try {
    const { movieId, reason } = req.body;
    const movie = await prisma.movie.findUnique({ where: { id: Number(movieId) } });

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const existing = await prisma.movieRequest.findFirst({
      where: { movieId: Number(movieId) },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una solicitud para esta película' });
    }

    const request = await prisma.movieRequest.create({
      data: {
        reason,
        movie: { connect: { id: Number(movieId) } },
        createdBy: { connect: { id: req.user.id } },
      },
      include: { movie: true, createdBy: true, votes: true },
    });

    await prisma.movie.update({
      where: { id: Number(movieId) },
      data: { availableForRequest: true },
    });

    res.status(201).json({
      ...request,
      voteCount: request.votes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear la solicitud' });
  }
};

const voteRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const request = await prisma.movieRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      return res.status(404).json({ error: 'Solicitud de película no encontrada' });
    }

    const existing = await prisma.requestVote.findFirst({
      where: { requestId, userId: req.user.id },
    });

    if (existing) {
      await prisma.requestVote.delete({ where: { id: existing.id } });
      return res.json({ message: 'Voto retirado' });
    }

    await prisma.requestVote.create({
      data: {
        request: { connect: { id: requestId } },
        user: { connect: { id: req.user.id } },
      },
    });

    res.json({ message: 'Voto registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo procesar el voto' });
  }
};

module.exports = { getRequests, createRequest, voteRequest };
