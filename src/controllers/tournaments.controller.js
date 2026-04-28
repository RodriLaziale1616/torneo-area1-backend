const prisma = require('../lib/prisma');

exports.create = async (req, res, next) => {
  try {
    const { name, slug, description, logoUrl } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        ok: false,
        error: 'name y slug son obligatorios',
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
      },
    });

    return res.status(201).json({
      ok: true,
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      ok: true,
      tournaments,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        error: 'Torneo no encontrado',
      });
    }

    return res.json({
      ok: true,
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, slug, description, logoUrl, isActive } = req.body;

    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return res.json({
      ok: true,
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.tournament.delete({
      where: { id: req.params.id },
    });

    return res.json({
      ok: true,
      message: 'Torneo eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
};