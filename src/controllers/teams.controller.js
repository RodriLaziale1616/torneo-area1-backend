const prisma = require('../lib/prisma');

exports.create = async (req, res, next) => {
  try {
    const { tournamentId, name, shortName, logoUrl } = req.body;

    if (!tournamentId || !name) {
      return res.status(400).json({
        ok: false,
        error: 'tournamentId y name son obligatorios',
      });
    }

    const team = await prisma.team.create({
      data: {
        tournamentId,
        name,
        shortName: shortName || null,
        logoUrl: logoUrl || null,
      },
    });

    // Crear fila inicial en standings
    await prisma.standing.create({
      data: {
        tournamentId,
        teamId: team.id,
      },
    });

    return res.status(201).json({
      ok: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { tournamentId } = req.query;

    const where = {};
    if (tournamentId) where.tournamentId = tournamentId;

    const teams = await prisma.team.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.json({
      ok: true,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        players: true,
        tournament: true,
      },
    });

    if (!team) {
      return res.status(404).json({
        ok: false,
        error: 'Equipo no encontrado',
      });
    }

    return res.json({
      ok: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, shortName, logoUrl } = req.body;

    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(shortName !== undefined ? { shortName } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
      },
    });

    return res.json({
      ok: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.team.delete({
      where: { id: req.params.id },
    });

    return res.json({
      ok: true,
      message: 'Equipo eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
};