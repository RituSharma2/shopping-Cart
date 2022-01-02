const orderModel = require("../Models/orderModel")
const userModel = require("../Models/userModel")
const cartModel = require("../Models/cartModel")
const mongoose = require("mongoose")

const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}
const validStatus = function (value) {
    return ["pending", "completed", "cancelled"].indexOf(value) !== -1
}
//===================================================================================================
const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!(validObject(userId))) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        let cartBody = req.body
        const { cancellable, status } = cartBody
        if(!isValidrequestBody(cartBody)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        if (!(validStatus(status))) {
            return res.status(400).send({ status: false, msg: "Provide a valid status" })
        }
        let checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "The user does not exist" })
        }

        let checkCart = await cartModel.findOne({ userId: userId }).
            select({ items: 1, totalPrice: 1, totalItems: 1 })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: `The cart of user ${userId} does not exist` })
        }
        let order = {
            userId: userId, items: checkCart.items,
            totalPrice: checkCart.totalPrice, totalItems: checkCart.totalItems,
            totalQuantity: checkCart.totalItems,
            cancellable: cancellable, status: status
        }
        let orderCreate = await orderModel.create(order)
        res.status(201).send({ status: true, msg: "Success", data: orderCreate })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createOrder = createOrder
//=====================================================================================================
const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        const { orderId, status } = req.body
        if (!(validObject(userId))) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        if(!isValidrequestBody(req.body)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        if (!validObject(orderId)) {
            return res.status(400).send({ status: false, msg: "Provide a valid orderId" })
        }
        if (!validStatus(status)) {
            return res.status(400).send({ status: false, msg: "Provide a valid status" })
        }
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }
        let findOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!findOrder) {
            return res.status(400).send({ status: false, msg: "orderId or userId does not match" })
        }
        let cancelCheck = findOrder.cancellable
        let statusCheck = findOrder.status
        if (statusCheck == "completed" || statusCheck == "cancelled") {
            return res.status(400).send({ status: false, msg: "status cannot be changed" })
        }
        if (cancelCheck) {
            let cancelOrder = await orderModel.findOneAndUpdate({ _id: orderId },
                { status: status }, { new: true })
            return res.status(200).send({ status: true, data: cancelOrder })
        } else {
            return res.status(400).send({ status: false, msg: "Ther order is not cancellable" })
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateOrder = updateOrder