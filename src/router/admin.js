const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
let ejs = require('ejs')
var jsonParser = bodyParser.json();
const keys = require('../keys/keys')

const Registration = require('../models/Reg');
const Transactions = require('../models/Transactions');

router.get('/admin/view', jsonParser, (req, res)=>{
    username = req.body.username;
    password = req.body.password;
    if(!username || !password){
        res.send({ 
            message: 'Enter the required details',
            status: 422
        });
    }
    else{
        if(username !== keys.adminUsername || password !== keys.adminPassword){
            res.send({ 
                message: 'Enter correct details',
                status: 422
            });
        }
        else{
            let data = {}
            //transaction and registration
            Registration.find()
            .select('-password')
            .then((registrationData) => {
                data = {"registrationData":registrationData}
            })
            Transactions.find()
            .then((transactionData)=>{
                data = ({...data,"transactionData":transactionData})
                res.send(data)
            })
        }
    }
})

module.exports = router;
