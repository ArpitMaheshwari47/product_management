const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        unique: true
    },
    description: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true //valid number/decimal
    },
    category:{
        type:String,
        required: true,
        trim: true,
    },
    deletedAt: {
        type: Date //when the document is deleted //default: null
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)