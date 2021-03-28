// reg details
const mongoose = require('mongoose')


const otpSchema = new mongoose.Schema({
    expire_at: {
        type: Date,
        default: Date.now, 
        expires: 60} ,
    email:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
        require: true
    },
    
})

const OTP = mongoose.model('OTP', otpSchema)

module.exports = OTP