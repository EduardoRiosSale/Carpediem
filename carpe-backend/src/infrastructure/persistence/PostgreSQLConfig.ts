import pg from 'pg';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

const { Pool } = pg;

// Creamos el "Pool" que manejará las conexiones a tu base de datos
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Le decimos qué hacer si hay un error inesperado
pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});