const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/teams.controller');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;