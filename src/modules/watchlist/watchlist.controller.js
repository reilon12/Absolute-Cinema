const prisma = require('../../config/db');

const getWatchlist = async (req, res) => {
  try {
    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener la watchlist' });
  }
};

const getFavoriteWatchlist = async (req, res) => {
  try {
    const favorites = await prisma.watchlistItem.findMany({
      where: { userId: req.user.id, isFavorite: true },
      include: { movie: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener los favoritos' });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const { movieId, status = 'PLAN_TO_WATCH', isFavorite = false } = req.body;
    const movie = await prisma.movie.findUnique({ where: { id: Number(movieId) } });

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const existing = await prisma.watchlistItem.findFirst({
      where: { userId: req.user.id, movieId: Number(movieId) },
    });

    if (existing) {
      return res.status(400).json({ error: 'La película ya está en tu watchlist' });
    }

    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        user: { connect: { id: req.user.id } },
        movie: { connect: { id: Number(movieId) } },
        status,
        isFavorite,
      },
      include: { movie: true },
    });

    res.status(201).json(watchlistItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo agregar a la watchlist' });
  }
};

const updateWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isFavorite } = req.body;

    const existing = await prisma.watchlistItem.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Elemento de watchlist no encontrado' });
    }

    const updated = await prisma.watchlistItem.update({
      where: { id: Number(id) },
      data: {
        status,
        isFavorite,
      },
      include: { movie: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar la watchlist' });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.watchlistItem.findUnique({ where: { id: Number(id) } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Elemento de watchlist no encontrado' });
    }

    await prisma.watchlistItem.delete({ where: { id: Number(id) } });
    res.json({ message: 'Eliminado de tu watchlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar el elemento' });
  }
};

module.exports = {
  getWatchlist,
  getFavoriteWatchlist,
  addToWatchlist,
  updateWatchlist,
  removeFromWatchlist,
};
