var mongoose = require('mongoose')
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
const reg = require('./src/router/reg')
const cors = require('cors')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

mongoose.connect('mongodb://localhost:27017/tedxCusatRegistration', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.connection.on('connected', () => {
  console.log('Connected to mdongo db');
});

mongoose.connection.on('error', (err) => {
  console.log('Connection to the db failed', err);
});

app.post('/', (req, res)=>{
    res.send(req.body);
})


app.use(cors())
app.use(reg)

var server = app.listen(8000, function () {
  console.log("Server Running on port.", server.address().port);
})