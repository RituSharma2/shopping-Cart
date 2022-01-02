const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refs: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            refs: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            minlength: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        // comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
        type: Number,
        required: true
        // comment: "Holds total number of items in the cart"
    },
    totalQuantity: {
        type: Number,
        required: true,
        comment: "Holds total number of items in the cart"
    },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', ' cancled']
    },
    deletedAt: {
        type: Date,
        //when the document is deleted
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })
module.exports = mongoose.model('Order', orderSchema)








