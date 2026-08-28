import mysql from "mysql2/promise";

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const pool = mysql.createPool({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? "3306"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  connectionLimit: 1,
  timezone: "Z",
});

try {
  await pool.execute(`DELETE FROM auth_challenges WHERE expires_at < DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 DAY)`);
  await pool.execute(`DELETE FROM auth_oidc_transactions WHERE expires_at < UTC_TIMESTAMP(3)`);
  await pool.execute(`DELETE FROM auth_rate_limits WHERE expires_at < UTC_TIMESTAMP(3)`);
  await pool.execute(`DELETE FROM auth_sessions WHERE absolute_expires_at < UTC_TIMESTAMP(3) OR revoked_at < DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 30 DAY)`);
  console.log("Expired authentication records removed.");
} finally {
  await pool.end();
}
