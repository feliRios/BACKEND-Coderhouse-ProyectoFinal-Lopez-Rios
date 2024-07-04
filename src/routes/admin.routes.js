const { Router } = require('express')
const {UpdateRole, deleteUser} = require('../controllers/admin.controllers')

const router = Router()

router.post('/:id/role', UpdateRole);
router.post('/:id/delete', deleteUser);

module.exports = router;
