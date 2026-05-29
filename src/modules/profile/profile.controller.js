const prisma = require('../../config/db');

const getLevelFromXP = (xp) => {
  if (xp >= 1200) return { level: 'Leyenda del Cine', nextLevel: null };
  if (xp >= 800) return { level: 'Maestro Cinematográfico', nextLevel: 1200 };
  if (xp >= 400) return { level: 'Crítico Premium', nextLevel: 800 };
  if (xp >= 150) return { level: 'Fanático de la Sala', nextLevel: 400 };
  return { level: 'Cinéfilo en Ascenso', nextLevel: 150 };
};

const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        watchlistItems: { include: { movie: true } },
        reviews: { include: { movie: true } },
        userBadges: { include: { badge: true } },
        userRewards: { include: { reward: true } },
        followers: true,
        followings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const watched = user.watchlistItems.filter((item) => item.status === 'WATCHED');
    const favoriteGenres = watched
      .flatMap((item) => item.movie?.genres || [])
      .reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});

    const topGenres = Object.entries(favoriteGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl || null,
      xp: user.xp || 0,
      level: getLevelFromXP(user.xp || 0),
      favoriteGenres: topGenres,
      followCount: user.followers.length,
      followingCount: user.followings.length,
      badges: user.userBadges.map((item) => item.badge),
      redeemedRewards: user.userRewards.map((item) => item.reward),
      watchedCount: watched.length,
      points: user.rewardsPoints || 0,
      reviewCount: user.reviews.length,
      recentMovies: watched.slice(0, 5).map((item) => item.movie),
    };

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
};

const getMyStats = async (req, res) => {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
    });

    const watched = watchlistItems.filter((item) => item.status === 'WATCHED');
    const genres = watched.flatMap((item) => item.movie?.genres || []);
    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalMoviesWatched: watched.length,
      watchlistSize: watchlistItems.length,
      favoriteGenres: Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => ({ genre, count: genreCounts[genre] })),
      genreBreakdown: Object.entries(genreCounts).map(([genre, count]) => ({ genre, count })),
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
  }
};

const getMyRewards = async (req, res) => {
  try {
    const userRewards = await prisma.userReward.findMany({
      where: { userId: req.user.id },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(userRewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las recompensas' });
  }
};

const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!reward) {
      return res.status(404).json({ error: 'Recompensa no encontrada' });
    }

    if (!user || user.rewardsPoints < reward.cost) {
      return res.status(400).json({ error: 'Puntos insuficientes para canjear esta recompensa' });
    }

    const existing = await prisma.userReward.findFirst({
      where: { userId: req.user.id, rewardId: reward.id },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya canjeaste esta recompensa' });
    }

    await prisma.userReward.create({
      data: {
        user: { connect: { id: req.user.id } },
        reward: { connect: { id: reward.id } },
      },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { rewardsPoints: { decrement: reward.cost } },
    });

    res.json({ message: 'Recompensa canjeada con éxito', reward });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo canjear la recompensa' });
  }
};

module.exports = {
  getMyProfile,
  getMyStats,
  getMyRewards,
  redeemReward,
};
