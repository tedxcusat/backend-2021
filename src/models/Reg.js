// reg details
const mongoose = require('mongoose')


const regSchema = new mongoose.Schema({
    customerName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    phoneNo:{
        type: String,
        require: true
    },
    gender:{
        type: String,
        require: true
    },
    age:{
        type: String,
        require: true
    },
    houseName:{
        type: String,
        require: true
    },
    address:{
        type: String,
        require: true
    },
    pin:{
        type: String,
        require: true
    }
})

const Registration = mongoose.model('Registration', regSchema)

module.exports = Registration