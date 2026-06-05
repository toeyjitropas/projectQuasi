const { prisma } = require('../prisma');

module.exports = async function (fastify) {
  const AUTH = { onRequest: [fastify.authenticate] };

  fastify.get('/audit', AUTH, async (req) => {
    const { table, recordId, from, to } = req.query;
    const where = {};
    if (table) where.tableName = table;
    if (recordId) where.recordId = recordId;
    if (from || to) {
      where.changedAt = {};
      if (from) where.changedAt.gte = new Date(from);
      if (to) where.changedAt.lte = new Date(to);
    }
    return prisma.auditLog.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      take: 200,
    });
  });
};
