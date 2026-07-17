import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import logger from './logger';

// ── Prisma Client ──
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// ── PostgreSQL Connection Pool ──
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'workflow_academy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  max: 20,                       // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,      // Close idle clients after 30s
  connectionTimeoutMillis: 5000, // Return an error after 5s if connection not established
  maxUses: 7500,                 // Close a connection after it has been used 7500 times
});

// Event listeners for pool
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  logger.debug('New client connected to the pool');
});

pool.on('remove', () => {
  logger.debug('Client removed from the pool');
});

// ── Database Connection Functions ──
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully via Prisma');

    // Test pool connection
    const client = await pool.connect();
    logger.info('Connection pool established successfully');
    client.release();
  } catch (error) {
    logger.error('Database connection failed', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await pool.end();
    logger.info('Database disconnected and pool closed');
  } catch (error) {
    logger.error('Database disconnection failed', error);
  }
};

export { prisma, pool };
export default prisma;