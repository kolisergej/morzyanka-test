import { Pool } from 'pg';


const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  database: 'test',
  password: null,
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err, client);
  process.exit(-1);
});

pool.connect()
  .catch((err) => {
    console.error('Connection postgres error occured', err);
    process.exit(-1);
  });

export default pool;
