const prisma = require('../lib/prisma');

exports.create = async (req, res, next) => {
  try {
    const {
      tournamentId,
      roundId,
      homeTeamId,
      awayTeamId,
      kickoffAt,
      location,
    } = req.body;

    if (!tournamentId || !roundId || !homeTeamId || !awayTeamId) {
      return res.status(400).json({
        ok: false,
        error: 'Datos incompletos',
      });
    }

    const match = await prisma.match.create({
      data: {
        tournamentId,
        roundId,
        homeTeamId,
        awayTeamId,
        kickoffAt: kickoffAt ? new Date(kickoffAt) : null,
        location: location || null,
      },
    });

    return res.status(201).json({
      ok: true,
      match,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { roundId, tournamentId } = req.query;

    const where = {};

    if (roundId) where.roundId = roundId;
    if (tournamentId) where.tournamentId = tournamentId;

    const matches = await prisma.match.findMany({
      where,
      include: {
        round: true,
        homeTeam: {
          include: {
            players: {
              orderBy: { name: 'asc' },
            },
          },
        },
        awayTeam: {
          include: {
            players: {
              orderBy: { name: 'asc' },
            },
          },
        },
        goalEvents: {
          include: {
            player: true,
          },
        },
      },
      orderBy: [
        { round: { order: 'asc' } },
        { kickoffAt: 'asc' },
      ],
    });

    return res.json({
      ok: true,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['SCHEDULED', 'PLAYED', 'POSTPONED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        error: 'Estado inválido',
      });
    }

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        homeTeam: true,
        awayTeam: true,
        round: true,
      },
    });

    return res.json({
      ok: true,
      match,
      message: 'Estado del partido actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
};