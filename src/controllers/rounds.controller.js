const prisma = require('../lib/prisma');

exports.create = async (req, res, next) => {
  try {
    const { tournamentId, name, order } = req.body;

    if (!tournamentId || !name || order === undefined) {
      return res.status(400).json({
        ok: false,
        error: 'tournamentId, name y order son obligatorios',
      });
    }

    const round = await prisma.round.create({
      data: {
        tournamentId,
        name,
        order,
      },
    });

    return res.status(201).json({
      ok: true,
      round,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { tournamentId } = req.query;

    const rounds = await prisma.round.findMany({
      where: { tournamentId },
      orderBy: { order: 'asc' },
    });

    return res.json({
      ok: true,
      rounds,
    });
  } catch (error) {
    next(error);
  }
};

exports.setCurrent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const round = await prisma.round.findUnique({
      where: { id },
    });

    if (!round) {
      return res.status(404).json({
        ok: false,
        error: 'Fecha no encontrada',
      });
    }

    await prisma.$transaction([
      prisma.round.updateMany({
        where: { tournamentId: round.tournamentId },
        data: { isCurrent: false },
      }),
      prisma.round.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);

    return res.json({
      ok: true,
      message: 'Fecha actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};