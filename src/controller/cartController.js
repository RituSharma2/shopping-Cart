
const userModel = require('../Models/userModel')
const productModel = require('../Models/productModel')
const cartModel = require('../Models/cartModel')
const mongoose=require('mongoose')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}
const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

//=======--------------------------------
const createCart = async function (req, res) {
    try {
        if (req.user.userId != req.params.userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })
        }
        let userId = req.params.userId
        let reqBody = req.body
        const { items } = reqBody
        if (!validObject(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId provided" })
        }
        if(!isValidrequestBody(reqBody)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        let findUserCart = await cartModel.findOne({ userId: userId })
        if (findUserCart) {
            if (!(items[0].productId && items[0].quantity)) {
                return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
            }
            var pricearr = []
            var qtyarr = []

            let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
            if (!a) {
                res.status(400).send({ status: false, msg: "The product requested is not found" })
            }
            let b = items[0].quantity
            pricearr.push(a.price * b)
            qtyarr.push(b)

            let price = pricearr.reduce((pv, cv) => pv + cv)
            let qty = qtyarr.reduce((pv, cv) => pv + cv)

            let addProduct = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, { $push: { items: items[0] } }, { new: true })
            addProduct.totalPrice = addProduct.totalPrice + price
            addProduct.totalItems = addProduct.totalItems + qty

            await addProduct.save()

            return res.status(200).send({ status: true, message: "product added to cart", data: addProduct })
        } else {
            if (!(items[0].productId && items[0].quantity)) {
                return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
            }

            var pricearr = []
            var qtyarr = []

            let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
            if (!a) {
                res.status(400).send({ status: false, msg: "The product requested is not found" })
            }
            let b = items[0].quantity
            pricearr.push(a.price * b)
            qtyarr.push(b)

            let price = pricearr.reduce((pv, cv) => pv + cv)
            let qty = qtyarr.reduce((pv, cv) => pv + cv)
            console.log("from else")
            let cart = { userId: userId, items: items[0], totalPrice: price, totalItems: qty }
            await cartModel.create(cart)
            return res.status(201).send({ status: true, msg: "success", data: cart })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createCart = createCart
//============================================================================================
const updateCart = async function (req, res) {
    try {

        let userId = req.params.userId
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })

        }
        let body = req.body
        const { cartId, productId, removeProduct } = body
        if(!isValidrequestBody(body)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        if (!validObject(userId)) {
            res.status(400).send({ status: false, msg: "Provide a valid userId" })
        }
        if (!validObject(cartId)) {
            res.status(400).send({ status: false, msg: "Provide a valid cartId" })
        }
        if (!validObject(productId)) {
            res.status(400).send({ status: false, msg: "Provide a valid userId" })
        }
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) {
            res.status(400).send({ status: false, msg: "The product no longer exist" })
        }
        let findCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!findCart) {
            res.status(400).send({ status: false, msg: "The user or cart does not match " })
        }
        let itemsarr = findCart.items
        let updateItems = []
        for (let r = 0; r < itemsarr.length; r++) {
            if (itemsarr[r].productId != productId) {
                updateItems.push(itemsarr[r])

            }
        }
        if (updateItems.length == 0) {
            if (removeProduct == 1) {

                let decreaseQty = await cartModel.findOneAndUpdate({ _id: cartId, "items.$.productId": productId },
                    { $inc: { "items.$.quantity": -1, totalItems: -1 } }, { new: true })
                return res.status(400).send({ status: true, msg: "qty decreased", data: decreaseQty })
            }
            let noProduct = await cartModel.findOneAndUpdate({ _id: cartId },
                { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        } else {
            let productarr = []
            for (let r = 0; r < updateItems.length; r++) {
                let c = updateItems[r].productId
                let priceFind = await productModel.findOne({ _id: c })
                productarr.push(priceFind.price)
            }
            var totalPriceop = productarr.reduce((pv, cv) => pv + cv)
            let qtyarr = []
            for (let r = 0; r < updateItems.length; r++) {
                let c = updateItems[r].quantity
                qtyarr.push(c)
            }
            var totalqtyp = qtyarr.reduce((pv, cv) => pv + cv)
        }
        if (removeProduct == 0) {

            // let deleteProduct = await cartModel.find({_id: cartId,items:{$elemMatch:{_id : "61cabd1383e21cc2539407d8"}}}).remove()
            let deleteProduct = await cartModel.findOneAndUpdate({ _id: cartId },
                { items: updateItems, totalPrice: totalPriceop, totalItems: totalqtyp }, { new: true })
            // let deleteProduct = cartModel.findOneAndUpdate( { _id:cartId}, { $pull: { items: [{ productId: productId }] } } )
            return res.status(200).send({ status: true, data: deleteProduct })
        }
        // if(removeProduct == 1){
        //     // let qtyDec = await cartModel
        //     let decreaseQty = await cartModel.findOneAndUpdate({_id: cartId, "items.$.productId": productId},
        //         {$inc:{"items.$.quantity": -1, totalItems: -1}}, {new: true})
        //         return res.status(400).send({status: true, msg: "qty decreased", data: decreaseQty})
        // }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateCart = updateCart
//=================================================================================================
const getCart = async function (req, res) {
    try {

        let userId = req.params.userId

        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })

        }
        if (!validObject(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "User does not exist" })
        }
        let findCart = await cartModel.findOne({ userId: userId }).select({ items: 1, _id: 0 })
        if (!findCart) {
            return res.status(400).send({ status: false, msg: "Cart does not exist" })
        }
        res.status(200).send({ status: true, data: findCart })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getCart = getCart
//====================================================================================================
const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })

        }
        if (!validObject(userId)) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        let checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: "Cart does not exist" })
        }
        let checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }
        let deleteItems = await cartModel.findOneAndUpdate({ userId: userId },
            { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        res.status(200).send({ status: true, msg: "Cart is empty", data: deleteItems })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }
}
module.exports.deleteCart = deleteCart