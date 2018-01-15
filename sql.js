// yarn add pg
// pg_ctl -D data initdb
// pg_ctl -D data -o "-p5801" -l postgres.log start
// createdb -p5801 test

// const sql = require("./sql.js");
// const s = new sql({
//   host: 'localhost',
//   port: 5801,
//   database: 'test',
// });
// console.log(await s.count());
// const ans = await s.find("e[Ll]+o");
// console.log(ans.map(i => i.option));
// s.close();

const { Pool } = require('pg');

async function create_table(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question TEXT UNIQUE NOT NULL,
    option TEXT NOT NULL,
    quiz JSONB,
    chosen JSONB
  )`);
}

function pg_stringify(obj) {
  if (obj == null) return null;
  return JSON.stringify(obj);
}

async function _insert(client, question, option, {quiz=null, chosen=null} = {}) {
  if (!question || !option) {
    throw Error("argument is null");
  }
  await client.query(`INSERT INTO questions (question, option, quiz, chosen) VALUES ($1, $2, $3, $4)`,
    [question, option, pg_stringify(quiz), pg_stringify(chosen)]);
}

async function _count(client) {
  const res = await client.query(`SELECT count(*) as count FROM questions;`);
  return res.rows[0].count;
}

async function _find_regex(client, regex) {
  const res = await client.query(`SELECT question, option FROM questions WHERE
    question ~ $1
  `, [regex]);
  return res.rows;
}

async function _find(client, key) {
  const res = await client.query(`SELECT question, option FROM questions WHERE
    question = $1
  `, [key]);
  return res.rows;
}

async function _test() {
  const config = {
    host: 'localhost',
    port: 5801,
    database: 'test',
  }
  const pool = new Pool(config);
  await create_table(pool);
  console.log(await _count(pool));
  try {
    await _insert(pool, "Hello world?! new", "42!", {chosen: {}});
  } catch(e) {
    if (!(typeof(e.message)=="string" && e.message.indexOf("questions_question_key") != -1)) {
      throw e;
    }
  }
  const ans = await _find(pool, "e[Ll]+o");
  console.log(ans.map(i => i.option));
  await pool.end();
} // _test();

module.exports = class QuestionSQL {
  constructor(config, delay_connect=false) {
    this.config = config;
    this.pool = null;
    if (!delay_connect) {
      this.connect();
    }
  }

  test() {
    return _test();
  }

  connect() {
    if (this.pool == null) {
      this.pool = Pool(this.config);
      create_table(this.pool).then();
    }
    return this.pool;
  }

  insert(question, option, others={}) {
    return _insert(this.pool, question, option, others);
  }

  count() { return _count(this.pool); }

  find(query) { return _find(this.pool, query); }

  close() {
    if (this.pool == null) {
      return;
    }
    this.pool.end();
    this.pool = null;
  }
}