const Router = require('express')

const router = new Router()
const registrationRouter = require('./registrationRoute')
const loginRouter = require('./loginRoute')
const searchController = require('../controllers/SearchController')

router.use('/registration', registrationRouter)
router.use('/login', loginRouter)

router.get('/searchUsers', searchController.getAllUsers)

module.exports = router