const prisma = require('../lib/prisma');

exports.health = async (req, res) => {
  return res.json({
    ok: true,
    message: 'API Torneo Área 1 funcionando correctamente',
  });
};

exports.getTournamentHome = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        standings: {
          include: {
            team: true,
          },
          orderBy: [
            { points: 'desc' },
            { goalDiff: 'desc' },
            { goalsFor: 'desc' },
          ],
        },
        rounds: {
          where: { isCurrent: true },
          include: {
            matches: {
              where: {
                status: 'SCHEDULED',
              },
              include: {
                homeTeam: true,
                awayTeam: true,
              },
              orderBy: { kickoffAt: 'asc' },
            },
            placements: {
              include: {
                sponsor: true,
              },
            },
          },
        },
        matches: {
          where: { status: 'PLAYED' },
          include: {
            homeTeam: true,
            awayTeam: true,
            goalEvents: {
              include: {
                player: {
                  include: {
                    team: true,
                  },
                },
                team: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        sponsors: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        error: 'Torneo no encontrado',
      });
    }

    const currentRound = tournament.rounds[0] || null;

    const allGoalEvents = await prisma.goalEvent.findMany({
      where: {
        match: {
          tournamentId: tournament.id,
          status: 'PLAYED',
        },
      },
      include: {
        player: {
          include: {
            team: true,
          },
        },
        team: true,
      },
    });

    const scorerMap = new Map();

    for (const goal of allGoalEvents) {
      const name = goal.player?.name || goal.manualPlayerName || 'Jugador';
      const teamName =
        goal.player?.team?.name ||
        goal.team?.name ||
        goal.manualTeamName ||
        'Equipo';

      const key = `${name}__${teamName}`;

      if (!scorerMap.has(key)) {
        scorerMap.set(key, {
          playerId: goal.playerId || key,
          name,
          team: teamName,
          goals: 0,
        });
      }

      scorerMap.get(key).goals += goal.quantity || 1;
    }

    const scorers = Array.from(scorerMap.values())
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 50);

    return res.json({
      ok: true,
      data: {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          slug: tournament.slug,
          description: tournament.description,
          logoUrl: tournament.logoUrl,
        },
        standings: tournament.standings,
        currentRound,
        latestResults: tournament.matches,
        topScorers: scorers,
        sponsors: tournament.sponsors,
      },
    });
  } catch (error) {
    next(error);
  }
};