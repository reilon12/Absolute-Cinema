const prisma = require('../../config/db');

const getRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({ orderBy: { cost: 'asc' } });
    res.json(rewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las recompensas' });
  }
};

const redeemReward = async (req, res) => {
  try {
    const rewardId = req.params.id;
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

    const userReward = await prisma.userReward.create({
      data: {
        user: { connect: { id: req.user.id } },
        reward: { connect: { id: reward.id } },
      },
      include: { reward: true },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { rewardsPoints: { decrement: reward.cost } },
    });

    res.json({ message: 'Recompensa canjeada con éxito', userReward });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo canjear la recompensa' });
  }
};

module.exports = {
  getRewards,
  redeemReward,
};
