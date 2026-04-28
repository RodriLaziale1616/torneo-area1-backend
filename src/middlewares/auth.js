const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        error: 'Token no proporcionado',
      });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        ok: false,
        error: 'Formato de token inválido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado',
    });
  }
}

module.exports = auth;