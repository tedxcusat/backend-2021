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


var email;
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);


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
                res.send({ 
                    message: 'OTP sent successfully',
                    status: 201
                });
            });
        }
    })
    
    
})


router.post('/resendOTP',function(req,res){
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
        res.send({ 
            message: 'OTP resent successful',
            status: 201
        });
    });

});

router.post('/verifyOTP',function(req,res){
    console.log(req.body);
    if(req.body.otp==otp){
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
    console.log(req.body.payload)
    if(!req.body.payload.payment){
    console.log('invalid')
        res.send({ status: 'invalid' })
    }
    else{
console.log('in else');
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
    console.log(transaction)

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
    console.log(req.body)
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
        console.log(registeredParticipant)
        bcrypt.compare(password, registeredParticipant.password)
        .then((doMatch) => {
            if (doMatch) {
                const token = jwt.sign({ id: registeredParticipant._id }, JWT_SECRET);
        const { _id, customerName } = registeredParticipant;
        res.json({ token, user: { _id, customerName }, status: 201});
            }
            else {
                res.send({ 
                    message: 'Incorrect passwors',
                    status: 422
                });
                
            }
        }).catch((err) => {console.log(err)})
    })
}

})


// return page
router.get('/verifyLogin', requireLogin ,(req, res)=>{
    Registration.findOne({ _id: req.params.id })
    .select('-password')
    .then((user) => {
        res.send(user)
    })
})

module.exports = router;

