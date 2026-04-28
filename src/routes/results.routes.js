const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/results.controller');

router.get('/:matchId', auth, controller.getByMatch);
router.post('/:matchId', auth, controller.createOrUpdate);
router.put('/:matchId', auth, controller.createOrUpdate);

module.exports = router;