const prisma = require('../prisma');

module.exports = async function (fastify) {
  fastify.get('/event-types', async () => {
    return prisma.eventType.findMany({ orderBy: { name: 'asc' } });
  });
};
