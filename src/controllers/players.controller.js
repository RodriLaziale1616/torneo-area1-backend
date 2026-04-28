const prisma = require('../lib/prisma');

exports.create = async (req, res, next) => {
  try {
    const { teamId, name, number } = req.body;

    if (!teamId || !name) {
      return res.status(400).json({
        ok: false,
        error: 'teamId y name son obligatorios',
      });
    }

    const player = await prisma.player.create({
      data: {
        teamId,
        name,
        number: number || null,
      },
    });

    return res.status(201).json({
      ok: true,
      player,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { teamId } = req.query;

    const where = {};
    if (teamId) where.teamId = teamId;

    const players = await prisma.player.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.json({
      ok: true,
      players,
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.player.delete({
      where: { id: req.params.id },
    });

    return res.json({
      ok: true,
      message: 'Jugador eliminado',
    });
  } catch (error) {
    next(error);
  }
};