import pkg from 'pg';
const { Pool, Client } = pkg;

import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 200;

const dbPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Ajuste conforme necessário para suas configurações de SSL
  },
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  max: 200,
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// function reconnectNotificationClient() {
//   console.log('Attempting to reconnect notification client...');
//   notificationClient = new Client({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   });

//   notificationClient.connect()
//     .then(() => {
//       console.log('Reconnected to database for listening notifications');
//       notificationClient.query('LISTEN update_pipeline');
//     })
//     .catch(err => {
//       console.error('Error reconnecting for notifications', err.stack);
//       setTimeout(reconnectNotificationClient, 5000);
//     });

//   notificationClient.on('error', (err) => {
//     console.error('Unexpected error on notification client', err);
//     reconnectNotificationClient();
//   });

//   notificationClient.on('end', () => {
//     console.log('Notification client disconnected, attempting to reconnect...');
//     reconnectNotificationClient();
//   });
// }

// export let notificationClient = new Client({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// notificationClient.connect()
//   .then(() => {
//     console.log('Connected to database for listening notifications');
//     notificationClient.query('LISTEN update_pipeline');
//   })
//   .catch(err => {
//     console.error('Error connecting for notifications', err.stack);
//     reconnectNotificationClient();
//   });

// notificationClient.on('error', (err) => {
//   console.error('Unexpected error on notification client', err);
//   reconnectNotificationClient();
// });

// notificationClient.on('end', () => {
//   console.log('Notification client disconnected, attempting to reconnect...');
//   reconnectNotificationClient();
// });

// export const notificationClient = await dbPool.connect()
// await notificationClient.query('LISTEN update_pipeline');
// await notificationClient.query('LISTEN update_card');



setInterval(async () => {
  const client = await dbPool.connect()
  try {
    const clients = await client.query('SELECT * FROM pg_stat_activity');
    console.log({ 'Active connections:': clients.rows.length });
  } finally {
    client.release();
  }
}, 55000);

export { dbPool };
