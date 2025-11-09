const Router = require('express')
const router = new Router()
const registrationController = require('../controllers/RegistrationController')


router.post('/', registrationController.register)

module.exports = router