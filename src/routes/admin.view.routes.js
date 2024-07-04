const { Router } = require('express')
const { adminView} = require('../controllers/admin.view.controllers')

const router = Router()

router.get('/', adminView)

module.exports = router

