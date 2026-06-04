const prisma = require('../prisma');

module.exports = async function (fastify) {
  // ── Event Types ──────────────────────────────────────────────────────
  fastify.post('/event-types', async (req, reply) => {
    const et = await prisma.eventType.create({ data: { name: req.body.name } });
    reply.code(201).send(et);
  });

  fastify.patch('/event-types/:id', async (req, reply) => {
    const et = await prisma.eventType.update({
      where: { id: parseInt(req.params.id) },
      data: { name: req.body.name },
    });
    return et;
  });

  fastify.delete('/event-types/:id', async (req, reply) => {
    await prisma.eventType.delete({ where: { id: parseInt(req.params.id) } });
    reply.code(204).send();
  });

  // ── Vendor Roles ─────────────────────────────────────────────────────
  fastify.get('/vendor-roles', async () => {
    return prisma.vendorRole.findMany({ orderBy: { name: 'asc' } });
  });

  fastify.post('/vendor-roles', async (req, reply) => {
    const vr = await prisma.vendorRole.create({ data: { name: req.body.name } });
    reply.code(201).send(vr);
  });

  fastify.patch('/vendor-roles/:id', async (req, reply) => {
    const vr = await prisma.vendorRole.update({
      where: { id: parseInt(req.params.id) },
      data: { name: req.body.name },
    });
    return vr;
  });

  fastify.delete('/vendor-roles/:id', async (req, reply) => {
    await prisma.vendorRole.delete({ where: { id: parseInt(req.params.id) } });
    reply.code(204).send();
  });

  // ── Investor Master ───────────────────────────────────────────────────
  fastify.get('/investor-masters', async () => {
    return prisma.investorMaster.findMany({ orderBy: { name: 'asc' } });
  });

  fastify.post('/investor-masters', async (req, reply) => {
    const { name, defaultInvestment, defaultReturnRate } = req.body;
    const im = await prisma.investorMaster.create({
      data: {
        name,
        defaultInvestment: defaultInvestment || null,
        defaultReturnRate: defaultReturnRate || null,
      },
    });
    reply.code(201).send(im);
  });

  fastify.patch('/investor-masters/:id', async (req, reply) => {
    const { name, defaultInvestment, defaultReturnRate } = req.body;
    const im = await prisma.investorMaster.update({
      where: { id: req.params.id },
      data: { name, defaultInvestment: defaultInvestment || null, defaultReturnRate: defaultReturnRate || null },
    });
    return im;
  });

  fastify.delete('/investor-masters/:id', async (req, reply) => {
    await prisma.investorMaster.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};
