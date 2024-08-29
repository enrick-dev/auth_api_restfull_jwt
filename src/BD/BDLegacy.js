import mysql from 'mysql2'
export const dbLegacy = mysql.createPool({
  host: process.env.DB_HOST_LEGACY,
  user: process.env.DB_USER_LEGACY,
  password: process.env.DB_PASSWORD_LEGACY,
  database: process.env.DB_DATABASE_LEGACY,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // Máximo de conexões inativas; o valor padrão é o mesmo que "connectionLimit"
  idleTimeout: 28800000, // Tempo limite das conexões inativas em milissegundos; o valor padrão é "60000"
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});