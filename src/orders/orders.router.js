const router = require("express").Router();
const controller = require('./orders.controller')
const notAllowed = require('../errors/methodNotAllowed')

router
.route('/')
.get(controller.list)
.post(controller.create)
.all(notAllowed)

router
.route('/:orderId')
.get(controller.read)
.put(controller.update)
.delete(controller.delete)
.all(notAllowed)
module.exports = router;