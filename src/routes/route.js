const express = require("express");
const router = express.Router();

//===========IMPORT Controller==========================
const userController = require('../controller/userController');
const Middleware = require('../Middleware/auth')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')


// User APIs
router.post('/User', userController.registerUser)
router.post('/login', userController.login)
router.get('/user/:userId/profile', Middleware.Auth, userController.GetUsers)
router.put('/user/:userId/profile', Middleware.Auth, userController.update)

// Product APIs
router.post('/products', productController.CreateProduct)
router.get('/products', productController.GetProducts)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.update)
router.delete('/products/:productId', productController.productDel)

// Cart APIs
router.post('/users/:userId/cart', Middleware.Auth, cartController.createCart)
router.put('/users/:userId/cart', Middleware.Auth, cartController.updateCart)
router.get('/users/:userId/cart', Middleware.Auth, cartController.getCart)
router.delete('/users/:userId/cart', Middleware.Auth, cartController.deleteCart)

// Order APIs
router.post('/users/:userId/orders', Middleware.Auth, orderController.createOrder)
router.put('/users/:userId/orders', Middleware.Auth, orderController.updateOrder)

module.exports = router;