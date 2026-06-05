const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function withUserContext(userEmail, fn) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user', ${userEmail}, true)`;
    return fn(tx);
  });
}

module.exports = { prisma, withUserContext };
