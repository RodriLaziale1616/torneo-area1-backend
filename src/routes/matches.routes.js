const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/matches.controller');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.patch('/:id/status', auth, controller.updateStatus);

module.exports = router;