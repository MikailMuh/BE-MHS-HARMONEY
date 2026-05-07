const { PrismaClient } = require('@prisma/client');
const config = require('./env');

const prismaOptions = {
  log: config.isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma__ || new PrismaClient(prismaOptions);

if (!config.isProduction) {
  globalForPrisma.__prisma__ = prisma;
}
module.exports = prisma;