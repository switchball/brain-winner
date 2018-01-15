// file: ugc.js

var fs = require("fs");

function intercept(mode, data) {
  if (mode == 'quiz') {
    q = data['title'].trim();
    option = data['option0'];
    id = data['id'];
    schoolId = data['schoolId'];
    quizType = data['quizType'];
    timeCreated = data['createdAt'];
    content = [id, q, option, schoolId, quizType, timeCreated].join("||") + '\n';
    append('ugc_quiz', content);
  } 
}

function write(filename, argument) {
  fs.writeFile(filename + '.txt', argument, function(err) {
    if (err) {
        return console.error(err);
    }
  });
}

function append(filename, argument) {
  fs.appendFile(filename + '.txt', argument, function(err) {
    if (err) {
        return console.error(err);
    }
  });
}

module.exports = {
  summary: 'a rule to get ugc quiz',
  *beforeSendResponse(requestDetail, responseDetail) {
    if (requestDetail.url.includes('question.hortor.net/question/quiz/getCheckQuiz')) {
      const newResponse = responseDetail.response;
      intercept('quiz', JSON.parse(newResponse.body)["data"]);
    } 
  },
};