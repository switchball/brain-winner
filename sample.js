// file: sample.js
var a = '';

async function search_answer(targetStr, uid, filename='all.txt') {
  var exec = require('child_process').exec;
  var cmdStr = 'type all.txt';
  await exec(cmdStr, { encoding: 'utf8' }, function(err,stdout,stderr){
    if(err) {
      console.log('error:'+cmdStr+stderr);
    } else {
      arr = stdout.split(/\r?\n/);
      var ret;
      for (var i = 0; i < arr.length; i++) {
        value = arr[i];
        if (value.includes(targetStr)) {
          console.log('Hit! => ' + value);
          console.log('Hit! => ' + value.split("||")[1]);
          ret = value.split("||")[1];
        }
      }
      //arr.forEach(function(value){ ... });
      if (ret) {
        append('user/'+uid, ret);
      } else {
        append('user/'+uid, 'No Hit!');
      }
    }
  });
}

async function open_baidu(question) {
  var child_process = require('child_process');
  await child_process.exec('start https://www.baidu.com/s?wd=' + question)
}

var fs = require("fs");

var states = {};

function binding(uid, nick) {
  write('user/'+uid+'_name', nick);
  console.log(uid + nick);
}

function intercept(mode, uid, data) {
  if (mode == 'match_start') {
    states[uid] = [];
    write('user/'+uid, "Ready...");
  } else if (mode == 'quiz') {
    state = states[uid];
    q = data['quiz'].trim();
    ops = data['options'];
    state.push({question: q, option: '(null)', options: ops});
    write('quiz', data["quiz"] + "\n" + data["options"] + "\n\n" + JSON.stringify(data));
    write('user/'+uid, data["quiz"] + "\n" + data["options"] + "\n");
    console.log('====================');
    console.log(data['quiz']);
    console.log(data["options"]);
    //s.find(data['quiz']).then((result)=>console.log(result));
    search_answer(data["quiz"], uid).then();
    //open_baidu(data["quiz"]).then();
  } else if (mode == 'choose') {
    state = states[uid];
    qid = data['num'];
    op = data['answer'] - 1;
    q_ref = state[qid-1];
    q_ref['option'] = q_ref['options'][op];
    write('choose', JSON.stringify(data));
    delete q_ref['options'];
    // insert to database
    //s.insert(q_ref['question'], q_ref['option']);
  } else if (mode == 'match_end') {
    state = states[uid];
    content = ""
    if (state.length == 5) {
      for (var i = 0; i < 5; i++) {
        quiz = state[i];
        content += quiz["question"] + "||" + quiz["option"];
        content += "\n";
      }
      write('out', content);
      append('all', content);
    } else {
      console.log('skip the data');
    }
    //s.count().then((count)=>console.log('Count: ' + count));
    delete states[uid];  // delete it
  }
}

function write(filename, argument) {
  fs.writeFileSync(filename + '.txt', argument, function(err) {
    if (err) {
        return console.error(err);
    }
  });
}

function append(filename, argument) {
  fs.appendFileSync(filename + '.txt', argument, function(err) {
    if (err) {
        return console.error(err);
    }
  });
}

function split_params(content) {
  var regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match;
  while(match = regex.exec(content)) {
      params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
}

module.exports = {
  summary: 'a rule to hack response and write response to file',
  *beforeSendResponse(requestDetail, responseDetail) {
    try {
      if (requestDetail.url.includes('question.hortor.net/question/player/login')) {
        const newResponse = responseDetail.response;
        data = JSON.parse(newResponse.body)["data"];
        uid = data['uid'];
        nick = data['userInfo']['nickName'];
        binding(uid, nick);
      } else if (requestDetail.url.includes('question.hortor.net/question/fight/match')) {
        request = split_params('?' + requestDetail.requestData.toString());
        const newResponse = responseDetail.response;
        intercept('match_start', request["uid"], JSON.parse(newResponse.body)["data"]);
      } else if (requestDetail.url.includes('question.hortor.net/question/fight/findQuiz')) {
        request = split_params('?' + requestDetail.requestData.toString());

        const newResponse = responseDetail.response;
        intercept('quiz', request["uid"], JSON.parse(newResponse.body)["data"]);
      } else if (requestDetail.url.includes('question.hortor.net/question/fight/choose')) {
        request = split_params('?' + requestDetail.requestData.toString());

        const newResponse = responseDetail.response;
        intercept('choose', request["uid"], JSON.parse(newResponse.body)["data"]);
      } else if (requestDetail.url.includes('question.hortor.net/question/fight/fightResult')) {
        request = split_params('?' + requestDetail.requestData.toString());

        const newResponse = responseDetail.response;
        intercept('match_end', request["uid"], JSON.parse(newResponse.body)["data"]);
      } else {
        const newResponse = responseDetail.response;
        //write('others', newResponse.body);
      }
    } catch (err) {
      console.log(err);
    }
  },
  *beforeDealHttpsRequest(requestDetail) {
    //console.log(requestDetail);
    if (requestDetail.host && requestDetail.host.includes('notifyquestion-tj.hortor.net')) {
      return false;
    } else if (requestDetail.host && requestDetail.host.includes('hortor.net')) {
      return true;
    } else {
      console.log("Ignore https from:" + requestDetail.host)
      return false;
    }
  },
};
