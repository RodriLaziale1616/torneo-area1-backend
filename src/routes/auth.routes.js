const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/auth.controller');

router.post('/login', controller.login);
router.get('/me', auth, controller.me);

module.exports = router;