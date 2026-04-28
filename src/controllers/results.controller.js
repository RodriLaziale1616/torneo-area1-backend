const prisma = require('../lib/prisma');
const { recalculateTournamentStandings } = require('../services/standings.service');

exports.createOrUpdate = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore, goalEvents = [] } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({
        ok: false,
        error: 'Partido no encontrado',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: {
          homeScore,
          awayScore,
          status: 'PLAYED',
        },
      });

      await tx.goalEvent.deleteMany({
        where: { matchId },
      });

      if (goalEvents.length > 0) {
        await tx.goalEvent.createMany({
          data: goalEvents.map((g) => ({
            matchId,
            playerId: g.playerId || null,
            teamId: g.teamId || null,
            manualPlayerName: g.manualPlayerName || null,
            manualTeamName: g.manualTeamName || null,
            quantity: Number(g.quantity) || 1,
            minute: g.minute || null,
          })),
        });
      }
    });

    await recalculateTournamentStandings(match.tournamentId);

    return res.json({
      ok: true,
      message: 'Resultado guardado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

exports.getByMatch = async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        goalEvents: {
          include: {
            player: true,
            team: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({
        ok: false,
        error: 'Partido no encontrado',
      });
    }

    return res.json({
      ok: true,
      match,
    });
  } catch (error) {
    next(error);
  }
};