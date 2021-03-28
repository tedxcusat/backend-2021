var mongoose = require('mongoose')
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
const reg = require('./src/router/reg')
const admin = require('./src/router/admin')
const cors = require('cors')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

mongoose.connect('mongodb://127.0.0.1:27017/tedxCusatRegistration', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.connection.on('connected', () => {
  console.log('Connected to mdongo db');
});

mongoose.connection.on('error', (err) => {
  console.log('Connection to the db failed', err);
});

app.use(bodyParser.json());

app.get('/', (req, res)=>{
        //console.log(req.body);
        res.send('welcome to tedx cusat');
})


app.use(cors())
app.use(reg)
app.use(admin)

var server = app.listen(8000, function () {
  console.log("Server Running on port.", server.address().port);})
