const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
//list, post, create, update, destroy, read
function list(req, res){
  res.json({data: dishes})
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}


function update(req, res, next) {
const { data: { name, description, price, image_url } = {} } = req.body;  
  const dishId = req.params.dishId 

//   res.locals.dish.id = id;
  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.price = price;
  res.locals.dish.image_url = image_url;
  res.json({ data: res.locals.dish });
  
}

function read(req,res){
  res.json({data: res.locals.dish})
}

//handler/checker middleware
function checkName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name !== '') {
    return next();
  }
//     console.log('name missing',  name)
  next({ status: 400, message: "Dish must include a name" });
}
function checkDescription(req, res, next) {
  const { data: { description } = {} } = req.body;

  if (description && description !== '') {
    return next();
  }
  next({ status: 400, message: "Dish must include a description" });
}
function checkPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && Number(price) === price) {
    return next();
  }
  next({ status: 400, message: "Dish must include price" });
  
}function checkImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url !== '') {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url" });
}
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function checkId(req, res, next){
  const {dishId} = req.params
  const {data: {id}} = req.body
  if(dishId === id || id === undefined || !id || id === null){
    next()
  }
    next({
    status: 400,
    message: `dish id ${id} dose not match`,
  });
}


module.exports ={
  list,
  read: [dishExists, read],
  update: [dishExists, checkName, checkDescription, checkPrice, checkImage, checkId, update, ],
  create: [checkName, checkDescription, checkPrice, checkImage, create],


}
// TODO: Implement the /dishes handlers needed to make the tests pass