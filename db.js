const { Pool } = require('pg');

const PG_URI = 'postgres://epazfmug:6uHd_sUuEyph-kpLFgCLURx1d66dBN_6@queenie.db.elephantsql.com:5432/epazfmug';

// creates a new pool using the connection URI
const pool = new Pool({
  connectionString: PG_URI
});

// exports an object with a method on it that makes queries to database
module.exports = {
  query: (text, params, callback) => {
    // console.log('Querying for: ', text);
    return pool.query(text, params, callback);
  }
};