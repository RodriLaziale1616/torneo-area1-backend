const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/rounds.controller');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.patch('/:id/set-current', auth, controller.setCurrent);

module.exports = router;