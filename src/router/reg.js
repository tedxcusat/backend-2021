const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const bcrypt = require('bcrypt')


const Registration = require('../models/Reg');
const Transactions = require('../models/Transactions');

const keys = require('../keys')

router.post('/register', jsonParser,(req, res) => {
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
        return res.status(422).json({ error: 'please add all the fields' });
    }
    Transactions.findOne({ "customerEmail": email })
    .then((successTransaction)=>{
        if(!successTransaction){
            res.status(422).json({ error: 'Enter same email used for payment' });
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
                res.json({ message: 'saved sucessfully' })
            })
            .catch((err) => console.log(err));
        })
        
        }})
    
});

// transaction
router.post('/transaction', [jsonParser, urlencodedParser], (req, res) =>{
        
        if(req.body.payload.payment){
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
router.post('/login', [jsonParser, urlencodedParser], (req, res) => {
    const customerEmail = req.body.customerEmail;
    const password = req.body.password;
    if(!customerEmail || !password){
        res.status(422).json({ error: 'Enter the required details' });
    }
    else{
        Registration.findOne({ "email" : customerEmail })
        .then((registeredParticipant)=>{
            if(!registeredParticipant){
                res.status(422).json({ error: 'Not registered user complete the registration' });
            }
            bcrypt.compare(password, registeredParticipant.password)
            .then((doMatch) => {
                if (doMatch) {
                    const token = jwt.sign({ id: savedAdmin._id }, JWT_SECRET);
            const { _id, adminName } = savedAdmin;
            res.json({ token, user: { _id, adminName } });
                }
                else {
                    res.status(422).json({ error: 'incorrect password' });
                }
            }).catch((err) => {console.log(err)})
        })
    }

})

// return page
router.get('/return', (req, res)=>{
    res.send('returned')
})

module.exports = router;

