const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const { JWT_SECRET,user, pass } = require('../keys/keys');
const requireLogin = require('../middleware/requireLogin');

const Registration = require('../models/Reg');
const Transactions = require('../models/Transactions');
const OTP = require('../models/otp')


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    
    auth: {
      user,
      pass,
    }
    
});

router.post('/sendOTP', jsonParser, (req, res) =>{
    email=req.body.email;
    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    Transactions.findOne({ "customerEmail": email })
    .then((successTransaction)=>{
        if(!successTransaction){
            res.send({ 
                message: 'Enter same email used for payment or complete the payment',
                status: 422
            });
        }
        else{
            var mailOptions={
                to: req.body.email,
                subject: "Otp for registration is: ",
                html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);   
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                const otpObj = new OTP({
                    email,
                    otp
                })
                // console.log(otpObj)
                otpObj.save()
                .catch((err) => {
                    console.log(err)
                })
                res.send({ 
                    message: "OTP sent successfully, If you didn't find the email check the spam mail.",
                    status: 201
                });
            });
            
        }
    })
    
    
})

router.post('/automaticEmailVerification', (req, res)=>{
    paymentId = req.body.paymentId
    Transactions.findOne({ paymentId })
    .then((transactionDetails) =>{
        if(!transactionDetails){
            res.send({ 
                message: 'Automatic Email verification not successful try manually',
                status: 422,
            });
        }else{
            res.send({ 
                message: 'Email verification successful',
                status: 201,
                customerEmail: transactionDetails.customerEmail
            });
        }
    })
    .catch((err) => console.log(err))
})


router.post('/resendOTP',function(req,res){
    const email = req.body.email;
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        const otpObj = new OTP({
            email,
            otp
        })
        // console.log(otpObj)
        otpObj.save()
        .catch((err) => {
            console.log(err)
        })
        res.send({ 
            message: 'OTP resent successful',
            status: 201
        });
    });

});

router.post('/verifyOTP',function(req,res){
    const email = req.body.email;
    const otp = req.body.otp;
    OTP.findOne({email})
    .then((otpdetails) => {
        if(!otpdetails){
            res.send({ 
                message: 'OTP expired',
                status: 422
            });
        }
        else{
            if(otp == otpdetails.otp){
                res.send({ 
                    message: 'You has been successfully verified',
                    status: 201
                });
            }
            else{
                res.send({ 
                    message: 'otp is incorrect',
                    status: 422
                });
            }
        }
    })

});

router.post('/register', jsonParser,(req, res) => {
    console.log('/register')
    customerName = req.body.customerName;
    email = req.body.email;
    password = req.body.password;
    phoneNo = req.body.phoneNo;
    gender = req.body.gender;
    age = req.body.age;
    houseName = req.body.houseName;
    address = req.body.address;
    pin = req.body.pin;
    if (!customerName || !email || !password || !phoneNo || !gender || !age || !houseName || !address || !pin) {
        res.send({ 
            message: 'please add all the fields',
            status: 422
        });
    }
    Transactions.findOne({ "customerEmail": email })
    .then((successTransaction)=>{
        if(!successTransaction){
            res.send({ 
                message: 'Enter same email used for payment',
                status: 422
            });
        }
        else{
        bcrypt.hash(password, 15)
        .then((hashedPassword)=>{
            const reg = new Registration({
                customerName,
                email,
                password : hashedPassword,
                phoneNo,
                gender,
                age,
                houseName,
                address,
                pin
            });
            reg.save()
            .then((reg)=>{
                res.send({ 
                    message: 'saved sucessfully',
                    status: 201
                });
            })
            .catch((err) => console.log(err));
        })

        }})

});


// transaction
router.post('/transaction', [jsonParser, urlencodedParser], (req, res) =>{


    console.log('/transaction');
    if(!req.body.payload.payment){
    console.log('invalid')
        res.send({ status: 'invalid' })
    }
    else{
    var payload = req.body.payload;
    var paymentId = payload.payment.entity.id;
    var paymentStatus = payload.payment.entity.status;
    var amount = payload.payment.entity.amount;
    var customerEmail = payload.payment.entity.notes.email;
    // var customerPhoneNo = payload.payment.entity.notes.phone;
    const transaction = new Transactions({
    paymentId,
    paymentStatus,
    amount,
    customerEmail,
    // customerPhoneNo
});

if (paymentStatus === 'captured'){
transaction.save()
    .then(() => {
        res.send({ status: 'done' })
        
    })
    .catch((err) => {
        console.log(err)
        res.status(402)
    });
}
else{
    res.send({ status: 'done' })
}}
})

//login
router.post('/login', [urlencodedParser, jsonParser], (req, res) => {
    console.log('/login')
const customerEmail = req.body.emailId;
const password = req.body.password;
if(!customerEmail || !password){
    res.send({ 
        message: 'Enter the required details',
        status: 422
    });
}
else{
    Registration.findOne({ "email" : customerEmail })
    .then((registeredParticipant)=>{
        if(!registeredParticipant){
            res.send({ 
                message: 'Not registered user complete the registration',
                status: 422
            });
        }
        bcrypt.compare(password, registeredParticipant.password)
        .then((doMatch) => {
            if (doMatch) {
                const token = jwt.sign({ id: registeredParticipant._id }, JWT_SECRET);
        const { _id, customerName } = registeredParticipant;
        res.json({ token, user: { _id, customerName }, status: 201});
            }
            else {
                res.send({ 
                    message: 'Incorrect password',
                    status: 422
                });
                
            }
        }).catch((err) => {console.log(err)})
    })
}

})


// return page
router.post('/verifyLogin', requireLogin ,(req, res)=>{
    const userObj = {
        "name": req.user.customerName,
        "email": req.user.email,
        "id": req.user._id
    }
    res.send(userObj)

})

module.exports = router;

