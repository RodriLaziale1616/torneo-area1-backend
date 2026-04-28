const prisma = require('../lib/prisma');

async function recalculateTournamentStandings(tournamentId) {
  const teams = await prisma.team.findMany({
    where: { tournamentId },
  });

  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'PLAYED',
    },
  });

  const baseTable = teams.map((team) => ({
    teamId: team.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  }));

  const tableMap = new Map(baseTable.map((row) => [row.teamId, row]));

  for (const match of matches) {
    const home = tableMap.get(match.homeTeamId);
    const away = tableMap.get(match.awayTeamId);

    if (!home || !away) continue;

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    home.played += 1;
    away.played += 1;

    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;

    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeScore < awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of tableMap.values()) {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  }

  await prisma.$transaction([
    prisma.standing.deleteMany({
      where: { tournamentId },
    }),
    prisma.standing.createMany({
      data: Array.from(tableMap.values()).map((row) => ({
        tournamentId,
        teamId: row.teamId,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDiff: row.goalDiff,
        points: row.points,
      })),
    }),
  ]);

  return true;
}

module.exports = {
  recalculateTournamentStandings,
};