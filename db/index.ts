import mysql, { type Pool } from "mysql2/promise";

declare global {
  // Reuse the pool during Next.js development hot reloads.
  var livingBlissMysqlPool: Pool | undefined;
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required MySQL environment variable: ${name}`);
  }
  return value;
}

function createPool() {
  const port = Number(process.env.DB_PORT ?? "3306");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT must be a valid TCP port.");
  }
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? "5");
  if (!Number.isInteger(connectionLimit) || connectionLimit < 1 || connectionLimit > 20) {
    throw new Error("DB_CONNECTION_LIMIT must be an integer between 1 and 20.");
  }

  return mysql.createPool({
    host: required("DB_HOST"),
    port,
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  });
}

export function getDb() {
  if (!globalThis.livingBlissMysqlPool) {
    globalThis.livingBlissMysqlPool = createPool();
  }
  return globalThis.livingBlissMysqlPool;
}
