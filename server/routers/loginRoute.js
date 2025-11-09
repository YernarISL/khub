const Router = require('express');
const router = new Router();
const loginController = require('../controllers/LoginController');

router.post('/', loginController.login);

module.exports = router;