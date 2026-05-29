const prisma = require('../../config/db');

const getReviews = async (req, res) => {
  try {
    const { movieId, trending } = req.query;
    const where = {};

    if (movieId) {
      where.movieId = Number(movieId);
    }

    const reviews = await prisma.review.findMany({
      where,
      include: { user: true, movie: true, likes: true },
      orderBy: trending ? { likes: { _count: 'desc' } } : { createdAt: 'desc' },
      take: 50,
    });

    res.json(reviews.map((review) => ({
      ...review,
      author: review.user,
      likeCount: review.likes.length,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las reseñas' });
  }
};

const getReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, movie: true, likes: true },
    });

    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    res.json({ ...review, author: review.user, likeCount: review.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener la reseña' });
  }
};

const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const movie = await prisma.movie.findUnique({ where: { id: Number(movieId) } });

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const existing = await prisma.review.findFirst({
      where: { movieId: Number(movieId), userId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya escribiste una reseña para esta película' });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        movie: { connect: { id: Number(movieId) } },
        user: { connect: { id: req.user.id } },
      },
      include: { user: true, movie: true, likes: true },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { xp: { increment: 25 }, rewardsPoints: { increment: 15 } },
    });

    res.status(201).json({ ...review, likeCount: review.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear la reseña' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const existing = await prisma.review.findUnique({ where: { id: Number(id) } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    const review = await prisma.review.update({
      where: { id: Number(id) },
      data: { rating: Number(rating), comment },
      include: { user: true, movie: true, likes: true },
    });

    res.json({ ...review, likeCount: review.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar la reseña' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.review.findUnique({ where: { id: Number(id) } });

    if (!existing || existing.userId !== req.user.id) {
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar la reseña' });
  }
};

const likeReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    const existing = await prisma.reviewLike.findFirst({
      where: { reviewId, userId: req.user.id },
    });

    if (existing) {
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      return res.json({ message: 'Like removido' });
    }

    await prisma.reviewLike.create({
      data: {
        review: { connect: { id: reviewId } },
        user: { connect: { id: req.user.id } },
      },
    });

    res.json({ message: 'Reseña marcada como favorita' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo procesar el like' });
  }
};

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
};
