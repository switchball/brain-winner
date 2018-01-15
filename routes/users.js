var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  try {
    users = {};
    fs.readdirSync('user/').forEach(file => {
      console.log(file);
      a = file.split('.txt')[0].split('_');
      uid = a.length > 0 ? a[0] : "";
      if (file.includes('name')) {
      	var nick = fs.readFileSync('user/' + file, 'utf8');
      	users[uid] = nick;
      } else {
      	users[uid] = 'unknown';
      }
    });
    res.render('user_list', {users: users});
  } catch (err) {
    console.log(err);
  }
});

router.get('/:user_id', function(req, res, next) {
  //res.send(req.params);
  try {
    uid = req.params['user_id'];
    var content = fs.readFileSync('user/' + uid + '.txt', 'utf8');
    res.set('Content-Type', 'text/html');
    details = content.split(/\n/g);
    question = details.length> 0 ? details[0] : "";
    options = details.length > 1 ? details[1] : "";
    correct = details.length > 2 ? details[2] : "";
    res.render('user_status', {question: question, options: options, correct: correct, uid: uid})
  } catch (err) {
    res.render('user_status', {question: 'Welcome!', options: '', correct: '在客户端开启对战后，本页面会自动刷新', uid: uid})
  }
});

router.get('/detail/:user_id', function(req, res, next) {
  //res.send(req.params);
  try {
    uid = req.params['user_id'];
    var content = fs.readFileSync('user/' + uid + '.txt', 'utf8');
    res.set('Content-Type', 'text/html');
    details = content.split(/\n/g);
    question = details.length> 0 ? details[0] : "";
    options = details.length > 1 ? details[1] : "";
    correct = details.length > 2 ? details[2] : "";
    res.json({question: question, options: options, correct: correct, code: 0})
  } catch (err) {
    res.json({question: 'Welcome!', options: '', correct: '在客户端开启对战后，本页面会自动刷新', code: -1})
  }
});

module.exports = router;
