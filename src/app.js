const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const tournamentsRoutes = require('./routes/tournaments.routes');
const teamsRoutes = require('./routes/teams.routes');
const playersRoutes = require('./routes/players.routes');
const roundsRoutes = require('./routes/rounds.routes');
const matchesRoutes = require('./routes/matches.routes');
const resultsRoutes = require('./routes/results.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://torneo-area1-frontend-production.up.railway.app'
  ],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend Torneo Área 1 activo',
  });
});

app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/admin/tournaments', tournamentsRoutes);
app.use('/admin/teams', teamsRoutes);
app.use('/admin/players', playersRoutes);
app.use('/admin/rounds', roundsRoutes);
app.use('/admin/matches', matchesRoutes);
app.use('/admin/results', resultsRoutes);

app.use(errorHandler);

module.exports = app;