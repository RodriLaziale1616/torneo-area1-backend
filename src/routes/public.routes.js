const router = require('express').Router();
const controller = require('../controllers/public.controller');
const { recalculateTournamentStandings } = require('../services/standings.service');

router.get('/health', controller.health);

router.get('/seed', async (req, res) => {
  const prisma = require('../lib/prisma');

  try {
    const existing = await prisma.tournament.findUnique({
      where: { slug: 'copa-mundial-club-area-1' },
    });

    if (existing) {
      return res.json({
        ok: true,
        message: 'El torneo ya existe',
        tournament: existing,
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: 'Copa Mundial Club Área 1',
        slug: 'copa-mundial-club-area-1',
        description: 'Torneo oficial del Club Área 1',
      },
    });

    return res.json({
      ok: true,
      message: 'Torneo creado correctamente',
      tournament,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'Error creando torneo',
    });
  }
});

router.get('/seed-full', async (req, res) => {
  const prisma = require('../lib/prisma');

  try {
    const slug = 'copa-mundial-club-area-1';

    let tournament = await prisma.tournament.findUnique({
      where: { slug },
    });

    if (!tournament) {
      tournament = await prisma.tournament.create({
        data: {
          name: 'Copa Mundial Club Área 1',
          slug,
          description: 'Torneo oficial del Club Área 1',
        },
      });
    }

    await prisma.goalEvent.deleteMany();
    await prisma.match.deleteMany();
    await prisma.round.deleteMany();
    await prisma.player.deleteMany();
    await prisma.standing.deleteMany();
    await prisma.team.deleteMany();

    const teamNames = [
      'Paraguay',
      'Argentina',
      'Brasil',
      'España',
      'Portugal',
      'Francia',
      'Alemania',
      'Italia',
    ];

    const teams = [];

    for (const name of teamNames) {
      const team = await prisma.team.create({
        data: {
          tournamentId: tournament.id,
          name,
        },
      });

      await prisma.standing.create({
        data: {
          tournamentId: tournament.id,
          teamId: team.id,
        },
      });

      for (let i = 1; i <= 5; i++) {
        await prisma.player.create({
          data: {
            teamId: team.id,
            name: `${name} Jugador ${i}`,
            number: i,
          },
        });
      }

      teams.push(team);
    }

    const round1 = await prisma.round.create({
      data: {
        tournamentId: tournament.id,
        name: 'Fecha 1',
        order: 1,
        isCurrent: false,
      },
    });

    const round2 = await prisma.round.create({
      data: {
        tournamentId: tournament.id,
        name: 'Fecha 2',
        order: 2,
        isCurrent: true,
      },
    });

    // Fecha 1 jugada
    const playedMatches = [
      [teams[0], teams[1]],
      [teams[2], teams[3]],
      [teams[4], teams[5]],
      [teams[6], teams[7]],
    ];

    for (const [home, away] of playedMatches) {
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);

      const match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          roundId: round1.id,
          homeTeamId: home.id,
          awayTeamId: away.id,
          status: 'PLAYED',
          homeScore,
          awayScore,
          kickoffAt: new Date(),
          location: 'Cancha Área 1',
        },
      });

      const players = await prisma.player.findMany({
        where: {
          teamId: { in: [home.id, away.id] },
        },
      });

      const totalGoals = homeScore + awayScore;

      for (let i = 0; i < totalGoals; i++) {
        const player = players[Math.floor(Math.random() * players.length)];

        await prisma.goalEvent.create({
          data: {
            matchId: match.id,
            playerId: player.id,
            teamId: player.teamId,
          },
        });
      }
    }

    // Fecha 2 programada
    const scheduledMatches = [
      [teams[0], teams[2]],
      [teams[1], teams[3]],
      [teams[4], teams[6]],
      [teams[5], teams[7]],
    ];

    let baseHour = 15;

    for (const [home, away] of scheduledMatches) {
      const kickoff = new Date();
      kickoff.setDate(kickoff.getDate() + 2);
      kickoff.setHours(baseHour, 0, 0, 0);

      await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          roundId: round2.id,
          homeTeamId: home.id,
          awayTeamId: away.id,
          status: 'SCHEDULED',
          kickoffAt: kickoff,
          location: 'Cancha Área 1',
        },
      });

      baseHour += 2;
    }

    await recalculateTournamentStandings(tournament.id);

    return res.json({
      ok: true,
      message: 'Seed completo generado correctamente',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'Error en seed completo',
    });
  }
});

router.get('/tournament/:slug/home', controller.getTournamentHome);

module.exports = router;