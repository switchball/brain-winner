var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  ip = req.headers.host.split(':')[0];
  res.render('index', { title: 'A Crowd-Sourcing Platform for BrainWinner!', ip: ip });
});

module.exports = router;
