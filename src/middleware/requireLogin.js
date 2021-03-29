const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('../keys/keys');

const User = require('../models/Reg')

module.exports = ((req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'you are not signed in' });
  }
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'you are not signed in' });
    }
    const { id } = payload;
    User.findById(id).then((userdata) => {
      req.user = userdata;
      next();
    });
  });
});