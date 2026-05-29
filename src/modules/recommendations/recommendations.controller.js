const prisma = require('../../config/db');

const getRecommendations = async (req, res) => {
  try {
    const userWatchlist = await prisma.watchlistItem.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
    });

    const watchedIds = userWatchlist.map((item) => item.movieId);
    const genres = userWatchlist.flatMap((item) => item.movie?.genres || []);
    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const favoriteGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const recommendations = await prisma.movie.findMany({
      where: {
        id: { notIn: watchedIds },
        OR: favoriteGenres.length
          ? favoriteGenres.map((genre) => ({ genres: { has: genre } }))
          : [{ featured: true }, { availableForRequest: true }],
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { releaseDate: 'desc' },
      ],
      take: 12,
    });

    res.json({
      recommended: recommendations,
      favoriteGenres,
      basedOn: watchedIds.length ? 'Tu historial reciente' : 'Estrenos destacados',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las recomendaciones' });
  }
};

module.exports = { getRecommendations };
