const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    paymentId:{
        type: String,
        required: true,
    },
    paymentStatus:{
        type: String,
        required: true,
    },
    amount:{
        type: String,
        required: true,
    },
    customerEmail:{
        type: String,
        required: true,
    },
    // customerphoneNo:{
    //     type: String,
    //     required: true,
    // }
})


const Transactions = mongoose.model('Transaction', transactionSchema)

module.exports = Transactions