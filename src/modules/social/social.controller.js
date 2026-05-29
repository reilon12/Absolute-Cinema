const prisma = require('../../config/db');

const getFeed = async (req, res) => {
  try {
    const followings = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true },
    });

    const followingIds = followings.map((item) => item.followingId);
    const activities = await prisma.socialActivity.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: { in: followingIds } },
        ],
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener el feed social' });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.id },
      include: { follower: true },
    });
    res.json(followers.map((item) => item.follower));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener los seguidores' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      include: { following: true },
    });
    res.json(following.map((item) => item.following));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener la gente a la que sigues' });
  }
};

const followUser = async (req, res) => {
  try {
    const targetId = Number(req.params.targetId);

    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return res.status(404).json({ error: 'Usuario objetivo no encontrado' });
    }

    const existing = await prisma.follow.findFirst({
      where: { followerId: req.user.id, followingId: targetId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya sigues a este usuario' });
    }

    await prisma.follow.create({
      data: {
        follower: { connect: { id: req.user.id } },
        following: { connect: { id: targetId } },
      },
    });

    res.json({ message: 'Ahora sigues a este usuario' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo seguir al usuario' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const targetId = Number(req.params.targetId);
    const existing = await prisma.follow.findFirst({
      where: { followerId: req.user.id, followingId: targetId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'No sigues a este usuario' });
    }

    await prisma.follow.delete({ where: { id: existing.id } });
    res.json({ message: 'Has dejado de seguir a este usuario' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo dejar de seguir al usuario' });
  }
};

module.exports = {
  getFeed,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
};
