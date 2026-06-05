const { prisma } = require('../prisma');

module.exports = async function (fastify) {
  const AUTH = { onRequest: [fastify.authenticate] };

  fastify.get('/event-types', AUTH, async () => {
    return prisma.eventType.findMany({ orderBy: { name: 'asc' } });
  });
};
