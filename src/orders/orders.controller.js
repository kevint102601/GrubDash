const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function destroy(req, res, next) {
  const {orderId} = req.params;
  const index = orders.findIndex((order) => {
    return order.id === orderId
  });
  if(!index) {
    next({
      status: 404,
      message: `order id dose not match`,
    });
  }
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function list(req, res, next) {
    res.json({data: orders})

}

function create(req, res, next) {
  const newOrder = req.body.data;
  newOrder.id = nextId();
  newOrder.status = 'pending';
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}
function read(req, res) {
  res.json({data: res.locals.order})
}

function update(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, status, dishes} = {} } = req.body;
  res.locals.order.deliverTo = deliverTo;
  res.locals.order.mobileNumber = mobileNumber;
  res.locals.order.status = status;
  res.locals.order.dishes = dishes;
  res.json({ data: res.locals.order });  


}

const checkOrder = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  if (!deliverTo || deliverTo == "")
      return next({ status: 400, message: `Order must include a deliverTo` });
    if (!mobileNumber || mobileNumber == "")
      return next({ status: 400, message: `Order must include a mobileNumber` });
    if (!dishes)
      return next({ status: 400, message: `Order must include a dish` });
    if (!Array.isArray(dishes) || dishes.length <= 0)
      return next({
        status: 400,
        message: `Order must include at least one dish`,
      });
    dishes.forEach((dish, index) => {
      if (
        !dish.quantity ||
        dish.quantity <= 0 ||
        typeof dish.quantity != "number"
      )
        return next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
    });
    res.locals.newOrder = {
      id: nextId(),
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
    next();
  };

function checkId(req, res, next){
 const orderId = req.params.orderId;
 const foundOrder = orders.find((order)=> order.id === orderId);
 if(foundOrder){
   res.locals.order = foundOrder;
   next();
 }
   next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}
function updateIdChecker(req, res, next){
  const {orderId} = req.params;
  const {data: {id}} = req.body;
   if(orderId === id || id === undefined || !id || id === null || id === ''){
    next()
  }
    next({
    status: 400,
    message: `order id ${id} dose not match`,
  });
}
function statusCheck(req, res, next){
  const {data: {status}} = req.body

  if(status === ''){
    next({status: 400, message: `Order must have a status of pending, preparing, 
    out-for-delivery, delivered`})
  }
  if(status === `delivered`){
    next({status: 400, message:`A delivered order cannot be changed`})
  }
  if(!status){
    next({status: 400, message:`Order must have a status of pending, preparing, 
    out-for-delivery, delivered`})
  }
   if(status === 'invalid'){
    next({status: 400, message:`Order must have a status of pending, preparing, 
    out-for-delivery, delivered`})
  }
    next();
}

function destroyStatusCheck(req,res,next){
  const {status} = res.locals.order
  console.log(status)
  if(status !== 'pending'){
     next({status: 400, message:`Order must have a status of pending`})
  }else{
      next()
  }
}

module.exports ={
  list,
  create: [checkOrder, create],
  read: [checkId, read],
  update: [checkId, updateIdChecker, checkOrder, statusCheck, update],
  delete: [checkId, destroyStatusCheck, destroy]

  }

